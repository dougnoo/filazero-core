import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantService } from './tenant.service';

// Infrastructure Adapters
import { InMemoryTenantRepository } from './infrastructure/in-memory-tenant.repository';

// Application Use Cases
import { GetTenantConfigUseCase } from './application/use-cases/get-tenant-config.use-case';
import { ValidateTenantAccessUseCase } from './application/use-cases/validate-tenant-access.use-case';
import { GetAllTenantsUseCase } from './application/use-cases/get-all-tenants.use-case';
import { GenerateTenantSessionIdUseCase } from './application/use-cases/generate-tenant-session-id.use-case';

// Dependency Injection Tokens
import { TENANT_REPOSITORY_TOKEN } from './tokens';

/**
 * Tenant Module following Clean Architecture
 * 
 * Dependencies flow:
 * TenantService (Facade)
 *   → Use Cases (Application Layer)
 *     → ITenantRepository Interface (Domain Layer)
 *       ← InMemoryTenantRepository (Infrastructure Layer)
 * 
 * Following Dependency Inversion Principle:
 * - High-level modules depend on abstractions (interfaces)
 * - Low-level modules (adapters) implement those abstractions
 */
@Module({
  imports: [ConfigModule],
  providers: [
    // Application Service (Facade)
    TenantService,

    // Application Use Cases
    GetTenantConfigUseCase,
    ValidateTenantAccessUseCase,
    GetAllTenantsUseCase,
    GenerateTenantSessionIdUseCase,

    // Infrastructure Adapter with Dependency Injection
    {
      provide: TENANT_REPOSITORY_TOKEN,
      useClass: InMemoryTenantRepository,
    },
  ],
  exports: [TenantService, TENANT_REPOSITORY_TOKEN],
})
export class TenantModule {}
