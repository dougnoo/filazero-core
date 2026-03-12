import { TenantConfig } from '../tenant-config.entity';

/**
 * Port Interface - Defines contract for tenant repository operations
 * Infrastructure adapters must implement this interface
 */
export interface ITenantRepository {
  /**
   * Get tenant configuration by ID
   * @throws NotFoundException if tenant not found
   * @throws UnauthorizedException if tenant is inactive
   */
  getTenantConfig(tenantId: string): Promise<TenantConfig>;

  /**
   * Validate if tenant exists and has access
   */
  validateTenantAccess(tenantId: string): Promise<boolean>;

  /**
   * Get all active tenants
   */
  getAllActiveTenants(): Promise<TenantConfig[]>;

  /**
   * Get all tenants (active and inactive)
   */
  getAllTenants(): Promise<TenantConfig[]>;

  /**
   * Check if tenant exists
   */
  exists(tenantId: string): Promise<boolean>;

  /**
   * Get tenant by vector store namespace
   */
  getTenantByNamespace(namespace: string): Promise<TenantConfig | null>;

  /**
   * Add or update tenant configuration
   */
  saveTenant(tenant: TenantConfig): Promise<void>;

  /**
   * Remove tenant (soft delete by setting isActive to false)
   */
  deactivateTenant(tenantId: string): Promise<void>;

  /**
   * Generate tenant-specific session ID
   */
  generateTenantSessionId(tenantId: string, originalSessionId: string): string;

  /**
   * Get vector store namespace for tenant
   */
  getVectorStoreNamespace(tenantId: string): Promise<string>;
}
