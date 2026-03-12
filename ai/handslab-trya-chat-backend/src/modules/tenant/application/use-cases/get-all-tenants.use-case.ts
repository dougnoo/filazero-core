import { Inject, Injectable, Logger } from '@nestjs/common';
import { TenantConfig } from '../../domain/tenant-config.entity';
import { ITenantRepository } from '../../domain/interfaces/tenant-repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '@modules/tenant/tokens';


/**
 * Application Use Case - Get All Tenants
 * Retrieves list of all active tenants
 * Implements Single Responsibility Principle
 */
@Injectable()
export class GetAllTenantsUseCase {
  private readonly logger = new Logger(GetAllTenantsUseCase.name);

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(includeInactive: boolean = false): Promise<TenantConfig[]> {
    try {
      this.logger.debug(`Getting all tenants (includeInactive: ${includeInactive})`);

      const tenants = includeInactive
        ? await this.tenantRepository.getAllTenants()
        : await this.tenantRepository.getAllActiveTenants();

      this.logger.log(`Retrieved ${tenants.length} tenants`);
      return tenants;
    } catch (error) {
      this.logger.error(`Failed to get all tenants: ${error.message}`, error.stack);
      throw error;
    }
  }
}
