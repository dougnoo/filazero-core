import { Injectable, Inject } from '@nestjs/common';
import { IntegrationConfig } from '../../domain/entities/integration-config.entity';
import type { IIntegrationRepository } from '../../domain/interfaces/integration.repository.interface';
import type { IEncryptionService } from '../../domain/interfaces/encryption.service.interface';
import {
  INTEGRATION_REPOSITORY_TOKEN,
  ENCRYPTION_SERVICE_TOKEN,
} from '../../domain/tokens';
import { CreateIntegrationDto } from '../dto/create-integration.dto';

@Injectable()
export class CreateIntegrationUseCase {
  constructor(
    @Inject(INTEGRATION_REPOSITORY_TOKEN)
    private readonly repository: IIntegrationRepository,
    @Inject(ENCRYPTION_SERVICE_TOKEN)
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(
    dto: CreateIntegrationDto,
    tenantId: string,
  ): Promise<IntegrationConfig> {
    const existing = await this.repository.findByTypeAndTenant(
      dto.type,
      tenantId,
    );
    if (existing.length > 0) {
      throw new Error(
        `Integration of type ${dto.type} already exists for this tenant`,
      );
    }

    const encryptedApiKey = await this.encryptionService.encrypt(dto.apiKey);

    const integration = IntegrationConfig.create(
      dto.alias || 'padrao',
      dto.provider,
      dto.type,
      encryptedApiKey,
      tenantId,
    );

    return this.repository.create(integration);
  }
}
