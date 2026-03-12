import {
  TimelineEvent,
  TimelineEventType,
  TimelineEventCategory,
} from '../../../database/entities/timeline-event.entity';

export interface CreateTimelineEventData {
  tenantId: string;
  memberUserId: string;
  eventType: TimelineEventType;
  category: TimelineEventCategory;
  title: string;
  description?: string | null;
  eventDate: Date;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ListTimelineEventsFilters {
  tenantId: string;
  memberUserIds: string[];
  eventType?: TimelineEventType;
  category?: TimelineEventCategory;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedTimelineEvents {
  data: TimelineEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ITimelineRepository {
  create(data: CreateTimelineEventData): Promise<TimelineEvent>;
  findByEntityId(entityType: string, entityId: string): Promise<TimelineEvent | null>;
  list(filters: ListTimelineEventsFilters): Promise<PaginatedTimelineEvents>;
  deleteByEntityId(entityType: string, entityId: string): Promise<void>;
}

export const TIMELINE_REPOSITORY_TOKEN = Symbol('ITimelineRepository');
