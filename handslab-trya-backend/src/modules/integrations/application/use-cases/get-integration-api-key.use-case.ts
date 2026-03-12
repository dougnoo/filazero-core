import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationConfig } from '../../domain/entities/integration-config.entity';
import type { IEncryptionService } from '../../domain/interfaces/encryption.service.interface';
import { ENCRYPTION_SERVICE_TOKEN } from '../../domain/tokens';
import { IntegrationType } from '../../domain/enums/integration-type.enum';
import { IntegrationProvider } from '../../domain/enums/integration-provider.enum';

@Injectable()
export class GetIntegrationApiKeyUseCase {
  constructor(
    @InjectRepository(IntegrationConfig)
    private readonly repository: Repository<IntegrationConfig>,
    @Inject(ENCRYPTION_SERVICE_TOKEN)
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(
    type: IntegrationType,
    provider: IntegrationProvider,
  ): Promise<string> {
    const integration = await this.repository.findOne({
      where: { type, provider, isActive: true },
    });

    if (!integration) {
      throw new NotFoundException(`Integration ${provider} not found`);
    }

    return this.encryptionService.decrypt(integration.apiKey);
  }
}
