import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { HealthPlan } from './health-plan.entity';

@Entity({ name: 'user_plans' })
@Unique('UQ_user_plans_user_plan', ['userId', 'planId'])
export class UserPlan extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @Column({ name: 'active_until', type: 'date', nullable: true })
  activeUntil?: Date | null;

  @Column({ name: 'card_number', type: 'varchar' })
  cardNumber!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.userPlans)
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_user_plans_user',
  })
  user!: User;

  @ManyToOne(() => HealthPlan, (plan) => plan.userLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'plan_id',
    foreignKeyConstraintName: 'FK_user_plans_plan',
  })
  plan!: HealthPlan;
}
