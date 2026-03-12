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
import { ProviderEntity } from './provider.entity';

@Entity('healthcare_claims')
@Index(['providerId'])
@Index(['operatorName'])
export class HealthcareClaimEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nome da Operadora
  @Column({ name: 'operator_name', type: 'varchar', length: 200 })
  operatorName: string;

  // Nome da Rede
  @Column({ name: 'network_name', type: 'varchar', length: 200 })
  networkName: string;

  // Nome do Prestador
  @Column({ name: 'provider_name', type: 'varchar', length: 500 })
  providerName: string;

  // Especialidade
  @Column({ name: 'specialty', type: 'varchar', length: 200 })
  specialty: string;

  // Sinistro (valor)
  @Column({
    name: 'claim_value',
    type: 'decimal',
    precision: 15,
    scale: 4,
    default: 0,
  })
  claimValue: number;

  // Provider matched (opcional - para analytics)
  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId: string | null;

  @Column({
    name: 'matching_confidence',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  matchingConfidence: number | null;

  // Import tracking
  @Column({ name: 'import_batch_id', type: 'uuid', nullable: true })
  importBatchId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ProviderEntity, { nullable: true })
  @JoinColumn({ name: 'provider_id' })
  provider?: ProviderEntity;
}
