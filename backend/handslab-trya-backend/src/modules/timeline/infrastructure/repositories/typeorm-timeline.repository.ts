import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimelineEvent } from '../../../../database/entities/timeline-event.entity';
import type {
  ITimelineRepository,
  CreateTimelineEventData,
  ListTimelineEventsFilters,
  PaginatedTimelineEvents,
} from '../../domain/timeline.repository.interface';

@Injectable()
export class TypeOrmTimelineRepository implements ITimelineRepository {
  private readonly logger = new Logger(TypeOrmTimelineRepository.name);

  constructor(
    @InjectRepository(TimelineEvent)
    private readonly timelineRepository: Repository<TimelineEvent>,
  ) {}

  async create(data: CreateTimelineEventData): Promise<TimelineEvent> {
    const event = this.timelineRepository.create({
      tenantId: data.tenantId,
      memberUserId: data.memberUserId,
      eventType: data.eventType,
      category: data.category,
      title: data.title,
      description: data.description,
      eventDate: data.eventDate,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata,
    });

    const saved = await this.timelineRepository.save(event);
    this.logger.log(`Evento de timeline criado: ${saved.id}`);
    return saved;
  }

  async findByEntityId(
    entityType: string,
    entityId: string,
  ): Promise<TimelineEvent | null> {
    return (
      (await this.timelineRepository.findOne({
        where: { entityType, entityId },
      })) || null
    );
  }

  async list(filters: ListTimelineEventsFilters): Promise<PaginatedTimelineEvents> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const qb = this.timelineRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.member', 'member')
      .where('event.tenant_id = :tenantId', { tenantId: filters.tenantId })
      .andWhere('event.member_user_id IN (:...memberUserIds)', {
        memberUserIds: filters.memberUserIds,
      });

    if (filters.eventType) {
      qb.andWhere('event.event_type = :eventType', {
        eventType: filters.eventType,
      });
    }

    if (filters.category) {
      qb.andWhere('event.category = :category', {
        category: filters.category,
      });
    }

    if (filters.dateFrom) {
      qb.andWhere('event.event_date >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      qb.andWhere('event.event_date <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    qb.orderBy('event.eventDate', 'DESC').addOrderBy('event.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteByEntityId(entityType: string, entityId: string): Promise<void> {
    await this.timelineRepository.delete({ entityType, entityId });
    this.logger.log(`Evento de timeline removido: ${entityType}/${entityId}`);
  }
}
