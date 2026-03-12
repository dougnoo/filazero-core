import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { LocationEntity } from './location.entity';
import { ServiceEntity } from './service.entity';

@Entity({ name: 'providers', schema: process.env.DB_SCHEMA || 'public' })
@Index(['name', 'locationHash', 'operatorId'], { unique: true })
export class ProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operator_id', type: 'uuid', nullable: true })
  @Index()
  operatorId?: string;

  @Column({ name: 'location_hash', length: 32 })
  @Index()
  locationHash: string;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({ name: 'phone1_area_code', length: 2, nullable: true })
  phone1AreaCode?: string;

  @Column({ name: 'phone1', length: 15, nullable: true })
  phone1?: string;

  @Column({ name: 'phone2_area_code', length: 2, nullable: true })
  phone2AreaCode?: string;

  @Column({ name: 'phone2', length: 15, nullable: true })
  phone2?: string;

  @Column({ name: 'whatsapp_area_code', length: 2, nullable: true })
  whatsappAreaCode?: string;

  @Column({ name: 'whatsapp', length: 15, nullable: true })
  whatsapp?: string;

  @Column({ name: 'insurance_company', length: 100 })
  @Index()
  insuranceCompany: string;

  @Column({ name: 'branch_name', length: 100 })
  branchName: string;

  @Column({ name: 'network_name', length: 255 })
  networkName: string;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => LocationEntity, (location) => location.providers, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'location_hash', referencedColumnName: 'hash' })
  location: LocationEntity;

  @OneToMany(() => ServiceEntity, (service) => service.provider, {
    cascade: true,
  })
  services: ServiceEntity[];
}
