import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Tenant } from '../../database/entities/tenant.entity';
import { TenantController } from './presentation/controllers/tenant.controller';
import { CreateTenantUseCase } from './application/use-cases/create-tenant/create-tenant.use-case';
import { ListTenantsUseCase } from './application/use-cases/list-tenants/list-tenants.use-case';
import { GetTenantUseCase } from './application/use-cases/get-tenant/get-tenant.use-case';
import { UpdateTenantOperatorUseCase } from './application/use-cases/update-tenant-operator/update-tenant-operator.use-case';
import { TypeOrmTenantRepository } from './infrastructure/repositories/typeorm-tenant.repository';
import { TENANT_REPOSITORY_TOKEN } from './domain/repositories/tenant.repository.token';
import { HealthOperatorsModule } from '../health-operators/health-operators.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Tenant]),
    forwardRef(() => HealthOperatorsModule),
  ],
  controllers: [TenantController],
  providers: [
    // Use Cases
    CreateTenantUseCase,
    ListTenantsUseCase,
    GetTenantUseCase,
    UpdateTenantOperatorUseCase,

    // Repositories
    {
      provide: TENANT_REPOSITORY_TOKEN,
      useClass: TypeOrmTenantRepository,
    },
  ],
  exports: [
    CreateTenantUseCase,
    ListTenantsUseCase,
    GetTenantUseCase,
    UpdateTenantOperatorUseCase,
    TENANT_REPOSITORY_TOKEN,
  ],
})
export class TenantModule {}
