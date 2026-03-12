import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { DOCUMENT_REPOSITORY_TOKEN } from '../../domain/repositories/document.repository.interface';
import { DocumentStorageService } from '../../infrastructure/services/document-storage.service';
import { ListDocumentsQueryDto } from '../dto/list-documents-query.dto';
import {
  PaginatedDocumentsResponseDto,
  DocumentResponseDto,
} from '../dto/document-response.dto';
import { User } from '../../../../database/entities/user.entity';
import { DocumentStatus } from '../../../../database/entities/medical-document.entity';
import { getDocumentTypeLabel } from '../../domain/catalog/document-catalog';

export interface ListDocumentsInput {
  query: ListDocumentsQueryDto;
  ownerUserId: string;
  tenantId: string;
}

@Injectable()
export class ListDocumentsUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY_TOKEN)
    private readonly documentRepository: IDocumentRepository,
    private readonly storageService: DocumentStorageService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(input: ListDocumentsInput): Promise<PaginatedDocumentsResponseDto> {
    const { query, ownerUserId, tenantId } = input;

    await this.validateMemberBelongsToOwner(
      query.memberUserId,
      ownerUserId,
      tenantId,
    );

    const result = await this.documentRepository.list({
      tenantId,
      ownerUserId,
      memberUserId: query.memberUserId,
      documentType: query.type,
      status: query.status,
      search: query.q,
      issueDateFrom: query.issueDateFrom
        ? new Date(query.issueDateFrom)
        : undefined,
      issueDateTo: query.issueDateTo ? new Date(query.issueDateTo) : undefined,
      page: query.page,
      limit: query.limit,
    });

    const data: DocumentResponseDto[] = await Promise.all(
      result.data.map(async (doc) => {
        let viewUrl = '';
        if (doc.s3Key) {
          viewUrl = await this.storageService.generatePresignedUrl(
            doc.s3Key,
            300,
          );
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const validUntilDate = doc.validUntil ? new Date(doc.validUntil) : null;
        const issueDateObj = new Date(doc.issueDate);
        const createdAtObj = new Date(doc.createdAt);

        const status =
          validUntilDate && validUntilDate < today
            ? DocumentStatus.EXPIRED
            : DocumentStatus.VALID;

        return {
          id: doc.id,
          documentType: doc.documentType,
          documentTypeLabel: getDocumentTypeLabel(doc.documentType),
          category: doc.category,
          title: doc.title,
          memberName: doc.member?.name || '',
          memberUserId: doc.memberUserId,
          issueDate: issueDateObj.toISOString().split('T')[0],
          validUntil: validUntilDate
            ? validUntilDate.toISOString().split('T')[0]
            : null,
          status,
          viewUrl,
          createdAt: createdAtObj.toISOString(),
        };
      }),
    );

    return {
      data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
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
