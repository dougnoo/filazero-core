import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../shared/domain/enums/user-role.enum';
import { DependentType } from '../../shared/domain/enums/dependent-type.enum';
import { Broker } from './broker.entity';
import { UserPlan } from './user-plan.entity';
import { Tenant } from './tenant.entity';
import { UserTutorialProgress } from 'src/modules/tutorials/domain/entities/user-tutorial-progress.entity';
import { UserChronicCondition } from './user-chronic-condition.entity';
import { UserMedication } from './user-medication.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @Index('IDX_users_cpf', { unique: true })
  cpf?: string;

  @Column({ type: 'date', name: 'birth_date' })
  birthDate!: Date;

  @Column({ type: 'varchar', nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true, name: 'cognito_id' })
  @Index('IDX_users_cognito_id', { unique: true })
  cognitoId?: string | null;

  @Column({ type: 'varchar' })
  type!: UserRole;

  @ManyToOne(() => Tenant, (tenant) => tenant.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'tenant_id',
    foreignKeyConstraintName: 'FK_users_tenant',
  })
  tenant?: Tenant | null;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  @Index('IDX_users_tenant_id')
  tenantId?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date | null;

  @Column({ name: 'onboarded_at', type: 'timestamp', nullable: true })
  onboardedAt?: Date | null;

  @Column({ name: 'onboarding_skipped', type: 'boolean', default: false })
  onboardingSkipped?: boolean;

  @ManyToOne(() => Broker, (broker) => broker.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'broker_id',
    foreignKeyConstraintName: 'FK_users_broker',
  })
  broker?: Broker | null;

  @Column({ name: 'broker_id', type: 'uuid', nullable: true })
  brokerId?: string | null;

  @OneToMany(() => UserPlan, (plan) => plan.user)
  userPlans?: UserPlan[];

  @Column({ type: 'text', nullable: true })
  allergies?: string;

  @ManyToMany(() => UserTutorialProgress, (progress) => progress.user)
  @JoinTable({
    name: 'user_tutorial',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tutorialId', referencedColumnName: 'id' },
  })
  userTutorials?: UserTutorialProgress[];

  @OneToMany(() => UserChronicCondition, (ucc) => ucc.user)
  chronicConditions?: UserChronicCondition[];

  @OneToMany(() => UserMedication, (um) => um.user)
  medications?: UserMedication[];

  @Column({ type: 'varchar', nullable: true, name: 'member_id' })
  @Index('IDX_users_member_id')
  memberId?: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'dependent_type' })
  dependentType?: DependentType;

  @ManyToOne(() => User, (user) => user.dependents, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'subscriber_id',
    foreignKeyConstraintName: 'FK_users_subscriber',
  })
  subscriber?: User | null;

  @Column({ name: 'subscriber_id', type: 'uuid', nullable: true })
  @Index('IDX_users_subscriber_id')
  subscriberId?: string | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  @Index('IDX_users_created_by')
  createdBy?: string | null;

  @OneToMany(() => User, (user) => user.subscriber)
  dependents?: User[];

  @Column({ type: 'varchar', nullable: true })
  gender?: string | null;
}
