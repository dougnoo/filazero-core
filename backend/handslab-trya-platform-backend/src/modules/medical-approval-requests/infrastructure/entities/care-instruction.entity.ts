import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MedicalApprovalRequestEntity } from './medical-approval-request.entity';

@Entity({
  name: 'care_instructions',
  schema: process.env.DB_SCHEMA || 'platform_dev',
})
export class CareInstructionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_approval_request_id', type: 'uuid' })
  medicalApprovalRequestId: string;

  @Column({ type: 'text' })
  instruction: string;

  @Column({ name: 'provided_by', length: 20 })
  providedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => MedicalApprovalRequestEntity,
    (request) => request.careInstructions,
  )
  @JoinColumn({ name: 'medical_approval_request_id' })
  medicalApprovalRequest: MedicalApprovalRequestEntity;
}
