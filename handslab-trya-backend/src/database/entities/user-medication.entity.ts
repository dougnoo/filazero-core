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
import { Medication } from './medication.entity';

@Entity({ name: 'user_medications' })
@Index('UQ_user_medications_unique', ['userId', 'medicationId'], {
  unique: true,
})
export class UserMedication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index('IDX_um_user')
  userId!: string;

  @Column({ name: 'medication_id', type: 'uuid' })
  @Index('IDX_um_medication')
  medicationId!: string;

  @Column({ type: 'varchar', nullable: true })
  dosage?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_um_user' })
  user!: User;

  @ManyToOne(() => Medication, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'medication_id',
    foreignKeyConstraintName: 'FK_um_medication',
  })
  medication!: Medication;
}
