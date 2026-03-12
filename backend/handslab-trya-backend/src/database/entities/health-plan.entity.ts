import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HealthOperator } from './health-operator.entity';
import { UserPlan } from './user-plan.entity';

@Entity({ name: 'health_plans' })
export class HealthPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ name: 'operator_id', type: 'uuid' })
  operatorId!: string;

  @ManyToOne(() => HealthOperator, (op) => op.plans, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'operator_id',
    foreignKeyConstraintName: 'FK_plans_operator',
  })
  operator!: HealthOperator;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => UserPlan, (link) => link.plan)
  userLinks!: UserPlan[];
}
