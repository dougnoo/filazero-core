import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'companies', schema: process.env.DB_SCHEMA || 'platform_dev' })
@Index('idx_company_cnpj', ['cnpj'])
@Index('idx_company_active', ['active'])
@Index('idx_company_tenant_id', ['tenantId'])
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 14, unique: true })
  cnpj: string;

  @Column({ length: 255 })
  email: string;

  @Column({ name: 'tenant_id', length: 255, nullable: true })
  tenantId?: string;

  @Column({ name: 'base_url', length: 500, nullable: true })
  baseUrl?: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
