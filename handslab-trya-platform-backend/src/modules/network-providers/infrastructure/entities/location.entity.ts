import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ProviderEntity } from './provider.entity';

@Entity({ name: 'locations', schema: process.env.DB_SCHEMA || 'public' })
export class LocationEntity {
  @PrimaryColumn({ length: 32 })
  hash: string;

  @Column({ name: 'postal_code', length: 8 })
  @Index()
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
  @Index()
  city: string;

  @Column({ length: 2 })
  @Index()
  state: string;

  @Column({ name: 'full_address', type: 'text' })
  fullAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  @Index()
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  @Index()
  longitude?: number;

  @Column({ name: 'geocoded_at', type: 'timestamp', nullable: true })
  geocodedAt?: Date;

  @Column({
    name: 'geocoding_status',
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  @Index()
  geocodingStatus: 'pending' | 'success' | 'failed' | 'not_found';

  @Column({ name: 'geocoding_attempts', type: 'int', default: 0 })
  @Index()
  geocodingAttempts: number;

  @Column({ name: 'geocoding_error', type: 'text', nullable: true })
  geocodingError?: string;

  @Column({ name: 'geocoding_provider', length: 50, nullable: true })
  geocodingProvider?: string;

  // Google Places fields
  @Column({ name: 'google_place_id', length: 255, nullable: true })
  @Index()
  googlePlaceId?: string;

  @Column({ name: 'google_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  @Index()
  googleRating?: number;

  @Column({ name: 'google_user_ratings_total', type: 'int', nullable: true })
  googleUserRatingsTotal?: number;

  @Column({ name: 'google_weekday_text', type: 'jsonb', nullable: true })
  googleWeekdayText?: string[];

  @Column({ name: 'google_place_url', length: 512, nullable: true })
  googlePlaceUrl?: string;

  @Column({ name: 'google_price_level', type: 'jsonb', nullable: true, comment: 'Nível de preço estruturado: {level: number, label: string}' })
  googlePriceLevel?: { level: number; label: string };

  @Column({ name: 'google_last_fetched_at', type: 'timestamp', nullable: true })
  googleLastFetchedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProviderEntity, (provider) => provider.location)
  providers: ProviderEntity[];
}
