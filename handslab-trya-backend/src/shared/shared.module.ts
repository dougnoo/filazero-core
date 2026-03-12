import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantGuard } from './presentation/tenant.guard';
import { RolesGuard } from './presentation/roles.guard';
import { TenantInterceptor } from './presentation/tenant.interceptor';
import { PasswordGeneratorService } from './application/services/password-generator.service';
import { TenantResolutionService } from './application/services/tenant-resolution.service';
import { TenantModule } from '../modules/tenant/tenant.module';
import { AuditEvent } from '../database/entities/audit-event.entity';
import { IAuditRepository } from './domain/repositories/audit.repository.interface';
import { TypeOrmAuditRepository } from './infrastructure/repositories/typeorm-audit.repository';

/**
 * Módulo compartilhado com guards, interceptors e decorators
 * Global para estar disponível em toda a aplicação
 */
@Global()
@Module({
  imports: [
    TenantModule, // Importar TenantModule para usar TENANT_REPOSITORY_TOKEN
    TypeOrmModule.forFeature([AuditEvent]),
  ],
  providers: [
    // Guards
    TenantGuard,
    RolesGuard,

    // Services
    PasswordGeneratorService,
    TenantResolutionService,

    // Repositories
    {
      provide: IAuditRepository,
      useClass: TypeOrmAuditRepository,
    },

    // Interceptor global para injetar tenant
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
  exports: [
    TenantGuard,
    RolesGuard,
    PasswordGeneratorService,
    TenantResolutionService,
    IAuditRepository,
  ],
})
export class SharedModule {}
