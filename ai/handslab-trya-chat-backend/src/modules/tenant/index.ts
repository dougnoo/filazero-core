/**
 * Public API of Tenant Module
 * Exports only what external modules need to consume
 * 
 * Following Interface Segregation Principle:
 * - Clients should not be forced to depend on interfaces they don't use
 */

// Module
export * from './tenant.module';

// Service (Facade)
export * from './tenant.service';

// Domain Entities (for type safety in external modules)
export { TenantConfig as TenantConfigEntity, TenantPlan } from './domain/tenant-config.entity';

// Domain Interfaces (for testing and mocking)
export type { ITenantRepository } from './domain/interfaces/tenant-repository.interface';

// Dependency Injection Tokens (for testing)
export { TENANT_REPOSITORY_TOKEN } from './tokens';
