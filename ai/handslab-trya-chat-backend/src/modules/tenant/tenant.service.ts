import { Injectable, Logger } from '@nestjs/common';
import { TenantConfig as DomainTenantConfig } from './domain/tenant-config.entity';
import { GetTenantConfigUseCase } from './application/use-cases/get-tenant-config.use-case';
import { ValidateTenantAccessUseCase } from './application/use-cases/validate-tenant-access.use-case';
import { GetAllTenantsUseCase } from './application/use-cases/get-all-tenants.use-case';
import { GenerateTenantSessionIdUseCase } from './application/use-cases/generate-tenant-session-id.use-case';

export interface TenantConfig {
  tenantId: string;
  name: string;
  awsAgentId: string;
  awsAgentAliasId: string;
  knowledgeBaseId?: string;
  vectorStoreNamespace: string;
  isActive: boolean;
  plan: 'basic' | 'premium' | 'enterprise';
  requestsPerMinute: number;
  maxSessionsPerDay: number;
}

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly getTenantConfigUseCase: GetTenantConfigUseCase,
    private readonly validateTenantAccessUseCase: ValidateTenantAccessUseCase,
    private readonly getAllTenantsUseCase: GetAllTenantsUseCase,
    private readonly generateTenantSessionIdUseCase: GenerateTenantSessionIdUseCase,
  ) {
    this.logger.log('TenantService initialized (Clean Architecture)');
  }

  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    const domainTenant = await this.getTenantConfigUseCase.execute(tenantId);
    return this.mapToLegacyInterface(domainTenant);
  }

  async validateTenantAccess(tenantId: string): Promise<boolean> {
    return this.validateTenantAccessUseCase.execute(tenantId);
  }

  getAllTenants(): TenantConfig[] {
    throw new Error('Deprecated: Use getAllTenantsAsync()');
  }

  generateTenantSessionId(tenantId: string, originalSessionId: string): string {
    return this.generateTenantSessionIdUseCase.execute(tenantId, originalSessionId);
  }

  async getVectorStoreNamespace(tenantId: string): Promise<string> {
    try {
      const tenant = await this.getTenantConfigUseCase.execute(tenantId);
      return tenant.vectorStoreNamespace;
    } catch {
      return `tenant-${tenantId}`;
    }
  }

  private mapToLegacyInterface(domainTenant: DomainTenantConfig): TenantConfig {
    return {
      tenantId: domainTenant.tenantId,
      name: domainTenant.name,
      awsAgentId: domainTenant.awsAgentId,
      awsAgentAliasId: domainTenant.awsAgentAliasId,
      knowledgeBaseId: domainTenant.knowledgeBaseId,
      vectorStoreNamespace: domainTenant.vectorStoreNamespace,
      isActive: domainTenant.isActive,
      plan: domainTenant.plan as any,
      requestsPerMinute: domainTenant.requestsPerMinute,
      maxSessionsPerDay: domainTenant.maxSessionsPerDay,
    };
  }
}
