import { TenantConfig } from '../../../tenant/tenant.service';

export interface ITenantRepository {
  getTenantConfig(tenantId: string): Promise<TenantConfig>;
  generateTenantSessionId(tenantId: string, sessionId: string): string;
  validateTenant(tenantId: string): Promise<boolean>;
}