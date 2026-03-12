import { Inject, Injectable, Logger } from '@nestjs/common';
import { TenantConfig } from '../../domain/tenant-config.entity';
import { ITenantRepository } from '../../domain/interfaces/tenant-repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '@modules/tenant/tokens';

/**
 * Application Use Case - Get Tenant Configuration
 * Orchestrates tenant retrieval with validation
 * Implements Single Responsibility Principle
 */
@Injectable()
export class GetTenantConfigUseCase {
  private readonly logger = new Logger(GetTenantConfigUseCase.name);

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(tenantId: string): Promise<TenantConfig> {
    try {
      this.logger.debug(`Getting tenant config for: ${tenantId}`);

      // Validate input
      if (!tenantId || tenantId.trim().length === 0) {
        throw new Error('Tenant ID is required');
      }

      // Get tenant from repository
      const tenant = await this.tenantRepository.getTenantConfig(tenantId);

      this.logger.log(`Retrieved tenant: ${tenant.name} (${tenant.plan})`);
      return tenant;
    } catch (error) {
      this.logger.error(`Failed to get tenant config: ${error.message}`, error.stack);
      throw error;
    }
  }
}
