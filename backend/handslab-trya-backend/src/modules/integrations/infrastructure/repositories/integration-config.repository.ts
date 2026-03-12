import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationConfig } from '../../domain/entities/integration-config.entity';
import { IIntegrationRepository } from '../../domain/interfaces/integration.repository.interface';
import { IntegrationType } from '../../domain/enums/integration-type.enum';

@Injectable()
export class IntegrationConfigRepository implements IIntegrationRepository {
  constructor(
    @InjectRepository(IntegrationConfig)
    private readonly repository: Repository<IntegrationConfig>,
  ) {}

  async findByTypeAndTenant(
    type: IntegrationType,
    tenantId: string,
  ): Promise<IntegrationConfig[]> {
    return this.repository.find({
      where: { type, tenantId },
    });
  }

  async create(integration: IntegrationConfig): Promise<IntegrationConfig> {
    return this.repository.save(integration);
  }

  async findByTenantAndAlias(
    tenantId: string,
    alias: string,
  ): Promise<IntegrationConfig | null> {
    return this.repository.findOne({
      where: { tenantId, alias },
    });
  }
}
