import { Injectable, Inject } from '@nestjs/common';
import { IntegrationType } from '../../domain/enums/integration-type.enum';
import type { IIntegrationRepository } from '../../domain/interfaces/integration.repository.interface';
import { INTEGRATION_REPOSITORY_TOKEN } from '../../domain/tokens';

export interface IntegrationListDto {
  id: string;
  name: string;
  alias: string;
  provider: string;
  type: IntegrationType;
  active: boolean;
}

@Injectable()
export class ListIntegrationsUseCase {
  constructor(
    @Inject(INTEGRATION_REPOSITORY_TOKEN)
    private readonly repository: IIntegrationRepository,
  ) {}

  async execute(
    type?: IntegrationType,
    tenantId?: string,
  ): Promise<IntegrationListDto[]> {
    if (!type) {
      throw new Error('Integration type must be provided');
    }
    if (!tenantId) {
      throw new Error('Tenant ID must be provided');
    }

    const configs = await this.repository.findByTypeAndTenant(type, tenantId);

    return configs.map((config) => ({
      id: config.id,
      name: config.alias,
      alias: config.alias,
      provider: config.provider,
      type: config.type,
      active: config.isActive,
    }));
  }
}
