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
import { ChronicCondition } from './chronic-condition.entity';

@Entity({ name: 'user_chronic_conditions' })
@Index('UQ_user_chronic_conditions_unique', ['userId', 'conditionId'], {
  unique: true,
})
export class UserChronicCondition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index('IDX_ucc_user')
  userId!: string;

  @Column({ name: 'condition_id', type: 'uuid' })
  @Index('IDX_ucc_condition')
  conditionId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_ucc_user' })
  user!: User;

  @ManyToOne(() => ChronicCondition, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'condition_id',
    foreignKeyConstraintName: 'FK_ucc_condition',
  })
  condition!: ChronicCondition;
}
