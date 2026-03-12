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

@Entity('provider_name_mappings')
@Index(['rawName'], { unique: true })
export class ProviderNameMappingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'raw_name', type: 'varchar', length: 500, unique: true })
  rawName: string;

  @Column({ name: 'normalized_name', type: 'varchar', length: 500 })
  normalizedName: string;

  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId: string | null;

  @Column({
    name: 'confidence',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 100,
  })
  confidence: number;

  @Column({ name: 'is_manual', type: 'boolean', default: false })
  isManual: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ProviderEntity, { nullable: true })
  @JoinColumn({ name: 'provider_id' })
  provider?: ProviderEntity;
}
