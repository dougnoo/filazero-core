import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum TermType {
  TERMS_OF_USE = 'TERMS_OF_USE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
}

@Entity('term_versions')
@Index('IDX_term_versions_type_version', ['type', 'version'], { unique: true })
@Index('IDX_term_versions_type_active', ['type', 'isActive'])
export class TermVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TermType })
  type: TermType;

  @Column({ type: 'varchar', length: 20 })
  version: string;

  @Column({ type: 'text' })
  s3Key: string;

  @Column({ type: 'text', nullable: true })
  s3Url: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ name: 'change_description', type: 'text', nullable: true })
  changeDescription: string;

  @Column({ name: 'uploaded_by', type: 'varchar', length: 100, nullable: true })
  uploadedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
