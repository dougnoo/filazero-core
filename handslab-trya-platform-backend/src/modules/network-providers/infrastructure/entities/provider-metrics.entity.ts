import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProviderEntity } from './provider.entity';

export interface SpecialtyCounts {
  [specialty: string]: number;
}

export interface TopProcedure {
  code: string;
  description: string;
  count: number;
}

export interface ServiceTypeDistribution {
  C?: number; // Consultation
  E?: number; // Exam
  I?: number; // Intervention
  P?: number; // Therapy
}

@Entity('provider_metrics')
@Index(['providerId'], { unique: true })
export class ProviderMetricsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id', type: 'uuid', unique: true })
  providerId: string;

  @Column({ name: 'total_claims', type: 'integer', default: 0 })
  totalClaims: number;

  @Column({
    name: 'total_claim_value',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalClaimValue: number;

  @Column({
    name: 'avg_claim_value',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  avgClaimValue: number;

  @Column({ name: 'specialty_counts', type: 'jsonb', default: {} })
  specialtyCounts: SpecialtyCounts;

  @Column({ name: 'top_procedures', type: 'jsonb', default: [] })
  topProcedures: TopProcedure[];

  @Column({ name: 'service_type_distribution', type: 'jsonb', default: {} })
  serviceTypeDistribution: ServiceTypeDistribution;

  @Column({ name: 'last_claim_date', type: 'date', nullable: true })
  lastClaimDate: Date | null;

  @Column({ name: 'first_claim_date', type: 'date', nullable: true })
  firstClaimDate: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => ProviderEntity)
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderEntity;
}
