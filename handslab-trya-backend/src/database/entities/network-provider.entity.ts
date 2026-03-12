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
  Unique,
} from 'typeorm';
import { NetworkProviderLocation } from './network-provider-location.entity';
import { NetworkProviderService } from './network-provider-service.entity';
import { HealthOperator } from './health-operator.entity';

@Entity({ name: 'network_providers' })
@Unique('uq_network_providers_operator_location_name', [
  'operatorId',
  'locationHash',
  'name',
])
@Index('idx_network_providers_operator_id', ['operatorId'])
@Index('idx_network_providers_location_hash', ['locationHash'])
@Index('idx_network_providers_name', ['name'])
@Index('idx_network_providers_is_active', ['isActive'])
export class NetworkProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operator_id', type: 'uuid' })
  operatorId: string;

  @ManyToOne(() => HealthOperator)
  @JoinColumn({ name: 'operator_id' })
  operator: HealthOperator;

  @Column({ name: 'location_hash', length: 32 })
  locationHash: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 20, nullable: true })
  cnpj?: string;

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

  @Column({ name: 'branch_name', length: 100, nullable: true })
  branchName?: string;

  @Column({ name: 'network_name', length: 255, nullable: true })
  networkName?: string;

  @Column({ name: 'plan_type', length: 255, nullable: true })
  planType?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => NetworkProviderLocation, (location) => location.providers, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'location_hash', referencedColumnName: 'hash' })
  location: NetworkProviderLocation;

  @OneToMany(() => NetworkProviderService, (service) => service.provider, {
    cascade: true,
  })
  services: NetworkProviderService[];
}
