import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';

@Entity({ name: 'imports', schema: process.env.DB_SCHEMA || 'public' })
export class ImportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operator_id', type: 'uuid', nullable: true })
  @Index()
  operatorId?: string;

  @Column({ name: 'operator_name', length: 255, nullable: true })
  operatorName?: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ length: 255 })
  filename: string;

  @Column({ name: 'total_rows', type: 'int', nullable: true })
  totalRows?: number;

  @Column({ name: 'processed_rows', type: 'int', default: 0 })
  processedRows: number;

  @Column({ name: 'new_locations', type: 'int', default: 0 })
  newLocations: number;

  @Column({ name: 'new_providers', type: 'int', default: 0 })
  newProviders: number;

  @Column({ name: 'new_services', type: 'int', default: 0 })
  newServices: number;

  @Column({
    name: 'import_type',
    type: 'varchar',
    length: 50,
    default: 'provider',
  })
  @Index()
  importType: 'provider' | 'claim';

  @Column({ name: 'imported_claims', type: 'int', nullable: true, default: 0 })
  importedClaims?: number;

  @Column({ name: 'matched_claims', type: 'int', nullable: true, default: 0 })
  matchedClaims?: number;

  @Column({ name: 'unmatched_claims', type: 'int', nullable: true, default: 0 })
  unmatchedClaims?: number;

  @Column({
    name: 'avg_match_confidence',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    default: 0,
  })
  avgMatchConfidence?: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'processing',
  })
  @Index()
  status: 'processing' | 'completed' | 'failed';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'file_key', length: 500, nullable: true })
  fileKey?: string;

  @CreateDateColumn({ name: 'started_at' })
  @Index()
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;
}
