import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITenantRepository } from '../../domain/interfaces/tenant-repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '@modules/tenant/tokens';

/**
 * Application Use Case - Validate Tenant Access
 * Checks if tenant exists and is active
 * Implements Single Responsibility Principle
 */
@Injectable()
export class ValidateTenantAccessUseCase {
  private readonly logger = new Logger(ValidateTenantAccessUseCase.name);

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(tenantId: string): Promise<boolean> {
    try {
      this.logger.debug(`Validating tenant access: ${tenantId}`);

      // Validate input
      if (!tenantId || tenantId.trim().length === 0) {
        this.logger.warn('Empty tenant ID provided for validation');
        return false;
      }

      // Validate access through repository
      const hasAccess = await this.tenantRepository.validateTenantAccess(tenantId);

      if (hasAccess) {
        this.logger.debug(`Tenant access granted: ${tenantId}`);
      } else {
        this.logger.warn(`Tenant access denied: ${tenantId}`);
      }

      return hasAccess;
    } catch (error) {
      this.logger.error(`Failed to validate tenant access: ${error.message}`, error.stack);
      return false;
    }
  }
}
