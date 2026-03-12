import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { NetworkProvider } from './network-provider.entity';

@Entity({ name: 'network_provider_services' })
@Index('idx_np_services_provider_id', ['providerId'])
@Index('idx_np_services_category', ['category'])
@Index('idx_np_services_specialty', ['specialty'])
export class NetworkProviderService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id', type: 'uuid' })
  providerId: string;

  @Column({ length: 255 })
  category: string;

  @Column({ type: 'text' })
  specialty: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => NetworkProvider, (provider) => provider.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: NetworkProvider;
}
