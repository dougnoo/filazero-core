import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { HealthPlan } from './health-plan.entity';
import { HealthOperatorStatus } from '../../shared/domain/enums/health-operator-status.enum';

@Entity({ name: 'health_operators' })
@Unique(['name'])
export class HealthOperator {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: HealthOperatorStatus.CADASTRADA,
  })
  @Index('idx_health_operators_status')
  status!: HealthOperatorStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => HealthPlan, (plan) => plan.operator)
  plans!: HealthPlan[];
}
