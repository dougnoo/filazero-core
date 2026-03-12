import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { HealthOperator } from './health-operator.entity';

@Entity({ name: 'tenants' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  @Index('IDX_tenants_name', { unique: true })
  name!: string;

  @Column({ name: 'operator_id', type: 'uuid', nullable: true })
  @Index('IDX_tenants_operator_id')
  operatorId?: string;

  @ManyToOne(() => HealthOperator, { nullable: true })
  @JoinColumn({ name: 'operator_id' })
  operator?: HealthOperator;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users!: User[];
}
