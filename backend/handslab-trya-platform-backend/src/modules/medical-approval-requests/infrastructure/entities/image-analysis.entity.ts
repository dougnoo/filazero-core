import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { MedicalApprovalRequestEntity } from './medical-approval-request.entity';

@Entity({
  name: 'image_analyses',
  schema: process.env.DB_SCHEMA || 'platform_dev',
})
@Index('idx_ia_request', ['medicalApprovalRequestId'])
export class ImageAnalysisEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_approval_request_id', type: 'uuid' })
  medicalApprovalRequestId: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'num_images', type: 'int' })
  numImages: number;

  @Column({ type: 'text', nullable: true })
  context?: string;

  @Column({ name: 'user_response', type: 'text' })
  userResponse: string;

  @Column({ name: 'detailed_analysis', type: 'text' })
  detailedAnalysis: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => MedicalApprovalRequestEntity,
    (request) => request.imageAnalyses,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'medical_approval_request_id' })
  medicalApprovalRequest: MedicalApprovalRequestEntity;
}
