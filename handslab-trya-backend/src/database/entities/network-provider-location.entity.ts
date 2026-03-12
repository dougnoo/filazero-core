import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NetworkProvider } from './network-provider.entity';
import { HealthOperator } from './health-operator.entity';

export type GeocodingStatus = 'pending' | 'success' | 'failed' | 'not_found';

@Entity({ name: 'network_provider_locations' })
@Index('idx_np_locations_operator_id', ['operatorId'])
@Index('idx_np_locations_city', ['city'])
@Index('idx_np_locations_state', ['state'])
@Index('idx_np_locations_postal_code', ['postalCode'])
@Index('idx_np_locations_geocoding_status', ['geocodingStatus'])
export class NetworkProviderLocation {
  /**
   * Hash do endereço (MD5 de: operatorId + postalCode + streetName + streetNumber + city + state)
   */
  @PrimaryColumn({ length: 32 })
  hash: string;

  @Column({ name: 'operator_id', type: 'uuid' })
  operatorId: string;

  @ManyToOne(() => HealthOperator)
  @JoinColumn({ name: 'operator_id' })
  operator: HealthOperator;

  @Column({ name: 'postal_code', length: 8 })
  postalCode: string;

  @Column({ name: 'street_type', length: 50, nullable: true })
  streetType?: string;

  @Column({ name: 'street_name', length: 255 })
  streetName: string;

  @Column({ name: 'street_number', length: 20, nullable: true })
  streetNumber?: string;

  @Column({ length: 255, nullable: true })
  complement?: string;

  @Column({ length: 100, nullable: true })
  neighborhood?: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 2 })
  state: string;

  @Column({ name: 'full_address', type: 'text' })
  fullAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  @Index('idx_np_locations_latitude')
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  @Index('idx_np_locations_longitude')
  longitude?: number;

  @Column({ name: 'geocoded_at', type: 'timestamp', nullable: true })
  geocodedAt?: Date;

  @Column({
    name: 'geocoding_status',
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  geocodingStatus: GeocodingStatus;

  @Column({ name: 'geocoding_attempts', type: 'int', default: 0 })
  geocodingAttempts: number;

  @Column({ name: 'geocoding_error', type: 'text', nullable: true })
  geocodingError?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => NetworkProvider, (provider) => provider.location)
  providers: NetworkProvider[];
}
