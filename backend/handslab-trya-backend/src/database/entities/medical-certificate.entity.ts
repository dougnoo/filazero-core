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

export enum CertificateStatus {
  PENDING = 'PENDING',
  VIEWED = 'VIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum AnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ValidationResult {
  VALID = 'VALID',
  WARNING = 'WARNING',
  INVALID = 'INVALID',
}

@Entity({ name: 'medical_certificates' })
export class MedicalCertificate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_medical_certificates_user',
  })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index('IDX_medical_certificates_user_id')
  userId!: string;

  @ManyToOne(() => Tenant, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'tenant_id',
    foreignKeyConstraintName: 'FK_medical_certificates_tenant',
  })
  tenant!: Tenant;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index('IDX_medical_certificates_tenant_id')
  tenantId!: string;

  @Column({ type: 'varchar', name: 'file_name' })
  fileName!: string;

  @Column({ type: 'varchar', name: 'file_url' })
  fileUrl!: string;

  @Column({ type: 'varchar', name: 's3_key' })
  s3Key!: string;

  @Column({ type: 'varchar', name: 'mime_type' })
  mimeType!: string;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize!: number;

  @Column({
    type: 'enum',
    enum: CertificateStatus,
    default: CertificateStatus.PENDING,
  })
  status!: CertificateStatus;

  @Column({
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.PENDING,
    name: 'analysis_status',
  })
  analysisStatus!: AnalysisStatus;

  @Column({ type: 'int', nullable: true, name: 'confidence_score' })
  confidenceScore?: number;

  @Column({ type: 'text', nullable: true, name: 'ai_conclusion' })
  aiConclusion?: string;

  @Column({
    type: 'enum',
    enum: ValidationResult,
    nullable: true,
    name: 'crm_validation',
  })
  crmValidation?: ValidationResult;

  @Column({ type: 'text', nullable: true, name: 'crm_observation' })
  crmObservation?: string;

  @Column({
    type: 'enum',
    enum: ValidationResult,
    nullable: true,
    name: 'authenticity_validation',
  })
  authenticityValidation?: ValidationResult;

  @Column({ type: 'text', nullable: true, name: 'authenticity_observation' })
  authenticityObservation?: string;

  @Column({
    type: 'enum',
    enum: ValidationResult,
    nullable: true,
    name: 'signature_validation',
  })
  signatureValidation?: ValidationResult;

  @Column({ type: 'text', nullable: true, name: 'signature_observation' })
  signatureObservation?: string;

  @Column({
    type: 'enum',
    enum: ValidationResult,
    nullable: true,
    name: 'date_validation',
  })
  dateValidation?: ValidationResult;

  @Column({ type: 'text', nullable: true, name: 'date_observation' })
  dateObservation?: string;

  @Column({
    type: 'enum',
    enum: ValidationResult,
    nullable: true,
    name: 'legibility_validation',
  })
  legibilityValidation?: ValidationResult;

  @Column({ type: 'text', nullable: true, name: 'legibility_observation' })
  legibilityObservation?: string;

  @Column({
    type: 'enum',
    enum: ValidationResult,
    nullable: true,
    name: 'clinic_validation',
  })
  clinicValidation?: ValidationResult;

  @Column({ type: 'text', nullable: true, name: 'clinic_observation' })
  clinicObservation?: string;

  @Column({
    type: 'enum',
    enum: ValidationResult,
    nullable: true,
    name: 'fraud_validation',
  })
  fraudValidation?: ValidationResult;

  @Column({ type: 'text', nullable: true, name: 'fraud_observation' })
  fraudObservation?: string;

  @Column({ type: 'text', nullable: true })
  observations?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'analyzed_at' })
  analyzedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'varchar', name: 'title', length: 100, nullable: true })
  title!: string;
}
