import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITenantRepository } from '../../domain/interfaces/tenant-repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '@modules/tenant/tokens';


/**
 * Application Use Case - Generate Tenant Session ID
 * Creates tenant-specific session identifier
 * Implements Single Responsibility Principle
 */
@Injectable()
export class GenerateTenantSessionIdUseCase {
  private readonly logger = new Logger(GenerateTenantSessionIdUseCase.name);

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  execute(tenantId: string, originalSessionId: string): string {
    try {
      this.logger.debug(`Generating tenant session ID for: ${tenantId}`);

      // Validate inputs
      if (!tenantId || tenantId.trim().length === 0) {
        throw new Error('Tenant ID is required');
      }

      if (!originalSessionId || originalSessionId.trim().length === 0) {
        throw new Error('Original session ID is required');
      }

      // Generate session ID
      const tenantSessionId = this.tenantRepository.generateTenantSessionId(
        tenantId,
        originalSessionId,
      );

      this.logger.debug(`Generated tenant session ID: ${tenantSessionId}`);
      return tenantSessionId;
    } catch (error) {
      this.logger.error(`Failed to generate tenant session ID: ${error.message}`, error.stack);
      throw error;
    }
  }
}
