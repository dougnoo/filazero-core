import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';

export enum MedicalDocumentType {
  LAB_EXAM = 'LAB_EXAM',
  IMAGING_EXAM = 'IMAGING_EXAM',
  REPORT = 'REPORT',
  VACCINATION = 'VACCINATION',
  CLINICAL_FILE = 'CLINICAL_FILE',
  PRESCRIPTION = 'PRESCRIPTION',
}

export enum DocumentStatus {
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
}

@Entity({ name: 'medical_documents' })
@Index('IDX_medical_documents_tenant_member_issue', [
  'tenantId',
  'memberUserId',
  'issueDate',
])
@Index('IDX_medical_documents_tenant_member_type', [
  'tenantId',
  'memberUserId',
  'documentType',
])
@Index('IDX_medical_documents_tenant_member_valid', [
  'tenantId',
  'memberUserId',
  'validUntil',
])
@Index('IDX_medical_documents_tenant_owner', ['tenantId', 'ownerUserId'])
export class MedicalDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'tenant_id',
    foreignKeyConstraintName: 'FK_medical_documents_tenant',
  })
  tenant!: Tenant;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'owner_user_id',
    foreignKeyConstraintName: 'FK_medical_documents_owner',
  })
  owner!: User;

  @Column({ name: 'owner_user_id', type: 'uuid' })
  @Index('IDX_medical_documents_owner_user_id')
  ownerUserId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'member_user_id',
    foreignKeyConstraintName: 'FK_medical_documents_member',
  })
  member!: User;

  @Column({ name: 'member_user_id', type: 'uuid' })
  @Index('IDX_medical_documents_member_user_id')
  memberUserId!: string;

  @Column({
    type: 'enum',
    enum: MedicalDocumentType,
    name: 'document_type',
  })
  documentType!: MedicalDocumentType;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'date', name: 'issue_date' })
  issueDate!: Date;

  @Column({ type: 'date', name: 'valid_until', nullable: true })
  validUntil?: Date | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName!: string;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType!: string;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize!: number;

  @Column({ type: 'varchar', length: 500, name: 's3_key' })
  s3Key!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
