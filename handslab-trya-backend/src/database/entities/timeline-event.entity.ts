import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';

export enum TimelineEventType {
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  DOCUMENT_EXPIRING = 'DOCUMENT_EXPIRING',
  DOCUMENT_EXPIRED = 'DOCUMENT_EXPIRED',
  VACCINATION = 'VACCINATION',
  LAB_EXAM = 'LAB_EXAM',
  IMAGING_EXAM = 'IMAGING_EXAM',
  MEDICAL_REPORT = 'MEDICAL_REPORT',
  PRESCRIPTION = 'PRESCRIPTION',
  MEDICAL_APPOINTMENT = 'MEDICAL_APPOINTMENT',
  MISSING_VACCINATION = 'MISSING_VACCINATION',
  MISSING_EXAM = 'MISSING_EXAM',
}

export enum TimelineEventCategory {
  DOCUMENT = 'DOCUMENT',
  HEALTH = 'HEALTH',
  ALERT = 'ALERT',
}

export enum DocumentStatus {
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
}

@Entity({ name: 'timeline_events' })
@Index('IDX_timeline_events_tenant_member_date', [
  'tenantId',
  'memberUserId',
  'eventDate',
])
@Index('IDX_timeline_events_tenant_member_type', [
  'tenantId',
  'memberUserId',
  'eventType',
])
@Index('IDX_timeline_events_entity', ['entityType', 'entityId'])
export class TimelineEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'tenant_id',
    foreignKeyConstraintName: 'FK_timeline_events_tenant',
  })
  tenant!: Tenant;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'member_user_id',
    foreignKeyConstraintName: 'FK_timeline_events_member',
  })
  member!: User;

  @Column({ name: 'member_user_id', type: 'uuid' })
  @Index('IDX_timeline_events_member_user_id')
  memberUserId!: string;

  @Column({
    type: 'enum',
    enum: TimelineEventType,
    name: 'event_type',
  })
  eventType!: TimelineEventType;

  @Column({
    type: 'enum',
    enum: TimelineEventCategory,
    name: 'category',
  })
  category!: TimelineEventCategory;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'date', name: 'event_date' })
  eventDate!: Date;

  @Column({ type: 'varchar', length: 50, name: 'entity_type', nullable: true })
  entityType?: string | null;

  @Column({ type: 'uuid', name: 'entity_id', nullable: true })
  entityId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
