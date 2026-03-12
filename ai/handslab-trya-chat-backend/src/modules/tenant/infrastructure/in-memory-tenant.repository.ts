import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantConfig, TenantPlan } from '../domain/tenant-config.entity';
import { ITenantRepository } from '../domain/interfaces/tenant-repository.interface';

/**
 * Infrastructure Adapter - In-Memory Tenant Repository
 * Implements ITenantRepository interface
 * 
 * NOTE: This is an in-memory implementation for development.
 * In production, replace with a database implementation (PostgreSQL, MongoDB, etc.)
 * The interface remains the same, following Dependency Inversion Principle.
 */
@Injectable()
export class InMemoryTenantRepository implements ITenantRepository {
  private readonly logger = new Logger(InMemoryTenantRepository.name);
  private readonly tenants: Map<string, TenantConfig> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeDefaultTenants();
  }

  /**
   * Initialize default tenants from environment variables
   * In production, this would load from database
   */
  private initializeDefaultTenants(): void {
    const defaultTenants: TenantConfig[] = [
      TenantConfig.createPremium(
        'tenant-operadora-1',
        'Operadora Saúde ABC',
        this.configService.get<string>('AWS_AGENT_ID_TENANT_1') || 
          this.configService.get<string>('AWS_AGENT_ID', ''),
        this.configService.get<string>('AWS_AGENT_ALIAS_ID_TENANT_1') || 
          this.configService.get<string>('AWS_AGENT_ALIAS_ID', ''),
        'operadora-1',
        'kb-operadora-1',
      ),
      TenantConfig.createBasic(
        'tenant-operadora-2',
        'Operadora Saúde XYZ',
        this.configService.get<string>('AWS_AGENT_ID_TENANT_2') || 
          this.configService.get<string>('AWS_AGENT_ID', ''),
        this.configService.get<string>('AWS_AGENT_ALIAS_ID_TENANT_2') || 
          this.configService.get<string>('AWS_AGENT_ALIAS_ID', ''),
        'operadora-2',
      ),
    ];

    defaultTenants.forEach(tenant => {
      this.tenants.set(tenant.tenantId, tenant);
    });

    this.logger.log(`Initialized ${defaultTenants.length} default tenants`);
  }

  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    const tenant = this.tenants.get(tenantId);

    if (!tenant) {
      this.logger.warn(`Tenant not found: ${tenantId}`);
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    if (!tenant.isActive) {
      this.logger.warn(`Tenant inactive: ${tenantId}`);
      throw new UnauthorizedException(`Tenant ${tenantId} is inactive`);
    }

    this.logger.debug(`Retrieved tenant config: ${tenant.name} (${tenantId})`);
    return tenant;
  }

  async validateTenantAccess(tenantId: string): Promise<boolean> {
    try {
      await this.getTenantConfig(tenantId);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        return false;
      }
      throw error;
    }
  }

  async getAllActiveTenants(): Promise<TenantConfig[]> {
    const activeTenants = Array.from(this.tenants.values())
      .filter(tenant => tenant.isActive);
    
    this.logger.debug(`Retrieved ${activeTenants.length} active tenants`);
    return activeTenants;
  }

  async getAllTenants(): Promise<TenantConfig[]> {
    const allTenants = Array.from(this.tenants.values());
    this.logger.debug(`Retrieved ${allTenants.length} total tenants`);
    return allTenants;
  }

  async exists(tenantId: string): Promise<boolean> {
    return this.tenants.has(tenantId);
  }

  async getTenantByNamespace(namespace: string): Promise<TenantConfig | null> {
    const tenant = Array.from(this.tenants.values())
      .find(t => t.vectorStoreNamespace === namespace);
    
    return tenant || null;
  }

  async saveTenant(tenant: TenantConfig): Promise<void> {
    this.tenants.set(tenant.tenantId, tenant);
    this.logger.log(`Saved tenant: ${tenant.name} (${tenant.tenantId})`);
  }

  async deactivateTenant(tenantId: string): Promise<void> {
    const tenant = await this.getTenantConfig(tenantId);
    const deactivatedTenant = tenant.withActiveStatus(false);
    this.tenants.set(tenantId, deactivatedTenant);
    this.logger.log(`Deactivated tenant: ${tenantId}`);
  }

  generateTenantSessionId(tenantId: string, originalSessionId: string): string {
    if (!tenantId || !originalSessionId) {
      throw new Error('Tenant ID and session ID are required');
    }
    return `${tenantId}:${originalSessionId}`;
  }

  async getVectorStoreNamespace(tenantId: string): Promise<string> {
    const tenant = this.tenants.get(tenantId);
    
    if (!tenant) {
      // Return default namespace if tenant not found
      this.logger.warn(`Tenant not found for namespace lookup: ${tenantId}, using default`);
      return `tenant-${tenantId}`;
    }

    return tenant.vectorStoreNamespace;
  }
}
