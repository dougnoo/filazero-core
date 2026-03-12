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
  name: 'attachments',
  schema: process.env.DB_SCHEMA || 'platform_dev',
})
@Index('idx_att_request', ['medicalApprovalRequestId'])
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_approval_request_id', type: 'uuid' })
  medicalApprovalRequestId: string;

  @Column({ name: 's3_key', length: 500 })
  s3Key: string;

  @Column({ name: 'original_name', length: 255 })
  originalName: string;

  @Column({ name: 'file_type', length: 50, default: 'image' })
  fileType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => MedicalApprovalRequestEntity,
    (request) => request.attachments,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'medical_approval_request_id' })
  medicalApprovalRequest: MedicalApprovalRequestEntity;
}
