import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MedicalApprovalRequestEntity } from './medical-approval-request.entity';

@Entity({ name: 'symptoms', schema: process.env.DB_SCHEMA || 'platform_dev' })
export class SymptomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_approval_request_id', type: 'uuid' })
  medicalApprovalRequestId: string;

  @Column({ length: 255 })
  description: string;

  @Column({ name: 'is_main', type: 'boolean', default: false })
  isMain: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => MedicalApprovalRequestEntity, (request) => request.symptoms)
  @JoinColumn({ name: 'medical_approval_request_id' })
  medicalApprovalRequest: MedicalApprovalRequestEntity;
}
