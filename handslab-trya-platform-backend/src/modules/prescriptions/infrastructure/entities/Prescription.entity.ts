import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';

export interface PrescriptionMedicationData {
  name: string;
  dosage: string;
  instructions: string;
  quantity: number;
}

export interface PrescriptionExamData {
  name: string;
  instructions?: string;
}

@Entity({
  name: 'prescriptions',
  schema: process.env.DB_SCHEMA || 'platform_dev',
})
export class PrescriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'memed_prescription_id' })
  @Index()
  memedPrescriptionId: string;

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  @Index()
  tenantId?: string;

  @Column({ type: 'uuid', name: 'doctor_id' })
  @Index()
  doctorId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: UserEntity;

  @Column({ type: 'uuid', name: 'patient_id' })
  @Index()
  patientId: string;

  @Column({ type: 'varchar', name: 'patient_name' })
  patientName: string;

  @Column({ type: 'varchar', name: 'patient_cpf', nullable: true })
  patientCpf?: string;

  @Column({ type: 'varchar', name: 'session_id', nullable: true })
  @Index()
  sessionId?: string;

  @Column({ type: 'jsonb', default: [] })
  medications: PrescriptionMedicationData[];

  @Column({ type: 'jsonb', default: [] })
  exams: PrescriptionExamData[];

  @Column({ type: 'varchar', name: 'pdf_url', nullable: true })
  pdfUrl?: string;

  @Column({ type: 'varchar', array: true, name: 'sent_via', nullable: true })
  sentVia?: string[];

  @Column({ type: 'timestamp', name: 'sent_at', nullable: true })
  sentAt?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
