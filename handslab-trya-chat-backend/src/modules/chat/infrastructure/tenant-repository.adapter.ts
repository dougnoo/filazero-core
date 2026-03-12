import { Injectable } from '@nestjs/common';
import { ITenantRepository } from '../domain/interfaces/tenant-repository.interface';
import { TenantService } from '../../tenant/tenant.service';
import { TenantConfig } from '../../tenant/tenant.service';

@Injectable()
export class TenantRepositoryAdapter implements ITenantRepository {
  constructor(private readonly tenantService: TenantService) {}

  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    return this.tenantService.getTenantConfig(tenantId);
  }

  generateTenantSessionId(tenantId: string, sessionId: string): string {
    return this.tenantService.generateTenantSessionId(tenantId, sessionId);
  }

  async validateTenant(tenantId: string): Promise<boolean> {
    try {
      const config = await this.getTenantConfig(tenantId);
      return !!config;
    } catch (error) {
      return false;
    }
  }
}