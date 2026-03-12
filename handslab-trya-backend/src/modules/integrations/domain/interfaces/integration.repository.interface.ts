import { IntegrationConfig } from '../entities/integration-config.entity';
import { IntegrationType } from '../enums/integration-type.enum';

export interface IIntegrationRepository {
  create(integration: IntegrationConfig): Promise<IntegrationConfig>;
  findByTenantAndAlias(
    tenantId: string,
    alias: string,
  ): Promise<IntegrationConfig | null>;
  findByTypeAndTenant(
    type: IntegrationType,
    tenantId: string,
  ): Promise<IntegrationConfig[]>;
}
