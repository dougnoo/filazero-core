export enum TimelineEventType {
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  VACCINATION = 'VACCINATION',
  LAB_EXAM = 'LAB_EXAM',
  IMAGING_EXAM = 'IMAGING_EXAM',
  MEDICAL_REPORT = 'MEDICAL_REPORT',
  PRESCRIPTION = 'PRESCRIPTION',
  MEDICAL_APPOINTMENT = 'MEDICAL_APPOINTMENT',
}

export enum TimelineEventCategory {
  DOCUMENT = 'DOCUMENT',
  HEALTH = 'HEALTH',
  ALERT = 'ALERT',
}

export interface TimelineEvent {
  id: string;
  eventType: TimelineEventType;
  category: TimelineEventCategory;
  title: string;
  description?: string | null;
  eventDate: string;
  memberName: string;
  memberUserId: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaginatedTimeline {
  data: TimelineEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListTimelineParams {
  memberUserId: string;
  eventType?: TimelineEventType;
  category?: TimelineEventCategory;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
