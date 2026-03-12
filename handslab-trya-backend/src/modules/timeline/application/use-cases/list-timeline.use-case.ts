import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ITimelineRepository } from '../../domain/timeline.repository.interface';
import { TIMELINE_REPOSITORY_TOKEN } from '../../domain/timeline.repository.interface';
import { ListTimelineQueryDto } from '../dto/list-timeline-query.dto';
import {
  PaginatedTimelineResponseDto,
  TimelineEventResponseDto,
} from '../dto/timeline-response.dto';
import { User } from '../../../../database/entities/user.entity';
import { DocumentStatus } from '../../../../database/entities/timeline-event.entity';

export interface ListTimelineInput {
  query: ListTimelineQueryDto;
  ownerUserId: string;
  tenantId: string;
}

@Injectable()
export class ListTimelineUseCase {
  constructor(
    @Inject(TIMELINE_REPOSITORY_TOKEN)
    private readonly timelineRepository: ITimelineRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(input: ListTimelineInput): Promise<PaginatedTimelineResponseDto> {
    const { query, ownerUserId, tenantId } = input;

    let memberUserIds: string[];

    if (query.memberUserId) {
      // Se memberUserId foi fornecido, valida e usa apenas ele
      await this.validateMemberBelongsToOwner(
        query.memberUserId,
        ownerUserId,
        tenantId,
      );
      memberUserIds = [query.memberUserId];
    } else {
      // Se não foi fornecido, busca titular + dependentes
      memberUserIds = await this.getMemberUserIds(ownerUserId, tenantId);
    }

    const result = await this.timelineRepository.list({
      tenantId,
      memberUserIds,
      eventType: query.eventType,
      category: query.category,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      page: query.page,
      limit: query.limit,
    });

    const data: TimelineEventResponseDto[] = result.data.map((event) => {
      const documentStatus = this.calculateDocumentStatus(event.metadata);
      
      // Extract alert message and priority if this is an alert
      const message = (event.category === 'ALERT' && event.metadata?.message) 
        ? String(event.metadata.message)
        : undefined;
      const priority = (event.category === 'ALERT' && event.metadata?.priority)
        ? String(event.metadata.priority)
        : undefined;

      return {
        id: event.id,
        eventType: event.eventType,
        category: event.category,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate instanceof Date 
          ? event.eventDate.toISOString().split('T')[0]
          : String(event.eventDate),
        memberName: event.member?.name || '',
        memberUserId: event.memberUserId,
        entityType: event.entityType,
        entityId: event.entityId,
        metadata: event.metadata,
        documentStatus,
        message,
        priority,
        createdAt: event.createdAt instanceof Date 
          ? event.createdAt.toISOString()
          : String(event.createdAt),
      };
    });

    return {
      data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  private async getMemberUserIds(
    ownerUserId: string,
    tenantId: string,
  ): Promise<string[]> {
    const owner = await this.userRepository.findOne({
      where: { id: ownerUserId, tenantId },
      relations: ['dependents'],
    });

    if (!owner) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    // Se o usuário é um dependente (tem subscriberId), retorna apenas ele
    if (owner.subscriberId) {
      return [ownerUserId];
    }

    // Se é titular, retorna ele + dependentes
    const memberIds = [ownerUserId];
    if (owner.dependents && owner.dependents.length > 0) {
      memberIds.push(...owner.dependents.map((dep) => dep.id));
    }

    return memberIds;
  }

  private calculateDocumentStatus(
    metadata?: Record<string, unknown> | null,
  ): DocumentStatus | undefined {
    if (!metadata) {
      return undefined;
    }

    const validUntil = metadata.validUntil || metadata.expirationDate || metadata.expiredAt;
    if (!validUntil) {
      return undefined;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const expDate = new Date(validUntil as string);
    expDate.setHours(0, 0, 0, 0);

    // If expiration date is in the future or today, document is valid
    if (expDate >= now) {
      return DocumentStatus.VALID;
    }

    // If expiration date is in the past, document is expired
    return DocumentStatus.EXPIRED;
  }

  private async validateMemberBelongsToOwner(
    memberUserId: string,
    ownerUserId: string,
    tenantId: string,
  ): Promise<void> {
    if (memberUserId === ownerUserId) {
      return;
    }

    const owner = await this.userRepository.findOne({
      where: { id: ownerUserId, tenantId },
      relations: ['dependents'],
    });

    if (!owner) {
      throw new ForbiddenException('Usuário titular não encontrado');
    }

    const isDependent = owner.dependents?.some(
      (dep) => dep.id === memberUserId,
    );

    if (!isDependent) {
      throw new ForbiddenException(
        'O membro selecionado não pertence à sua família',
      );
    }
  }
}
