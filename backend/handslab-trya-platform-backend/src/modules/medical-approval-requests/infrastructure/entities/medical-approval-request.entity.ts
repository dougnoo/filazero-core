import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApprovalStatus } from '../../domain/enums/approval-status.enum';
import { UrgencyLevel } from '../../domain/enums/urgency-level.enum';
import { ImageAnalysisEntity } from './image-analysis.entity';
import { AttachmentEntity } from './attachment.entity';
import { SymptomEntity } from './symptom.entity';
import { SuggestedExamEntity } from './suggested-exam.entity';
import { CareInstructionEntity } from './care-instruction.entity';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';

@Entity({
  name: 'medical_approval_requests',
  schema: process.env.DB_SCHEMA || 'platform_dev',
})
@Index('idx_mar_status', ['status'])
@Index('idx_mar_urgency', ['urgencyLevel'])
@Index('idx_mar_created', ['createdAt'])
@Index('idx_mar_session', ['sessionId'])
export class MedicalApprovalRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', unique: true, length: 255 })
  sessionId: string;

  @Column({ name: 'user_id', length: 255 })
  userId: string;

  @Column({ name: 'tenant_id', length: 255 })
  tenantId: string;

  @Column({ name: 'patient_name', length: 255 })
  patientName: string;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ name: 'assigned_doctor_id', type: 'uuid', nullable: true })
  assignedDoctorId?: string;

  @Column({
    name: 'urgency_level',
    type: 'enum',
    enum: UrgencyLevel,
  })
  urgencyLevel: UrgencyLevel;

  @Column({ name: 'chief_complaint', type: 'text' })
  chiefComplaint: string;

  @Column({ name: 'conversation_summary', type: 'text' })
  conversationSummary: string;

  @Column({ name: 'care_recommendation', type: 'text' })
  careRecommendation: string;

  @Column({ name: 'doctor_notes', type: 'text', nullable: true })
  doctorNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => ImageAnalysisEntity,
    (analysis) => analysis.medicalApprovalRequest,
    {
      cascade: true,
    },
  )
  imageAnalyses: ImageAnalysisEntity[];

  @OneToMany(
    () => AttachmentEntity,
    (attachment) => attachment.medicalApprovalRequest,
    {
      cascade: true,
    },
  )
  attachments: AttachmentEntity[];

  @OneToMany(() => SymptomEntity, (symptom) => symptom.medicalApprovalRequest, {
    cascade: true,
  })
  symptoms: SymptomEntity[];

  @OneToMany(() => SuggestedExamEntity, (exam) => exam.medicalApprovalRequest, {
    cascade: true,
  })
  suggestedExams: SuggestedExamEntity[];

  @OneToMany(
    () => CareInstructionEntity,
    (instruction) => instruction.medicalApprovalRequest,
    {
      cascade: true,
    },
  )
  careInstructions: CareInstructionEntity[];

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'assigned_doctor_id' })
  assignedDoctor?: UserEntity;
}
