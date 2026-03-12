import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IntegrationType } from '../enums/integration-type.enum';
import { IntegrationProvider } from '../enums/integration-provider.enum';

@Entity('integration_configs')
export class IntegrationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  alias: string;

  @Column({ type: 'enum', enum: IntegrationProvider })
  provider: IntegrationProvider;

  @Column({ type: 'enum', enum: IntegrationType })
  type: IntegrationType;

  @Column({ type: 'text' })
  apiKey: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  private constructor() {}

  static create(
    alias: string,
    provider: IntegrationProvider,
    type: IntegrationType,
    apiKey: string,
    tenantId: string,
  ): IntegrationConfig {
    const integration = new IntegrationConfig();
    integration.alias = alias;
    integration.provider = provider;
    integration.type = type;
    integration.apiKey = apiKey;
    integration.tenantId = tenantId;
    integration.isActive = true;
    return integration;
  }
}
