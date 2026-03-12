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
  name: 'suggested_exams',
  schema: process.env.DB_SCHEMA || 'platform_dev',
})
export class SuggestedExamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_approval_request_id', type: 'uuid' })
  medicalApprovalRequestId: string;

  @Column({ name: 'exam_name', length: 255 })
  examName: string;

  @Column({ name: 'suggested_by', length: 20 })
  suggestedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => MedicalApprovalRequestEntity,
    (request) => request.suggestedExams,
  )
  @JoinColumn({ name: 'medical_approval_request_id' })
  medicalApprovalRequest: MedicalApprovalRequestEntity;
}
