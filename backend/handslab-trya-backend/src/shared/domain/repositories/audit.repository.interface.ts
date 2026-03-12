import { AuditEventType } from '../../../database/entities/audit-event.entity';

export type CreateAuditEventData = {
  eventType: AuditEventType;
  entityType: string;
  entityId: string;
  userId?: string;
  payload?: Record<string, unknown>;
};

export abstract class IAuditRepository {
  abstract create(data: CreateAuditEventData): Promise<void>;
}
