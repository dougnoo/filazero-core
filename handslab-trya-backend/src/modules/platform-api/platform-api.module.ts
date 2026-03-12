import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PlatformApiController } from './presentation/controllers/platform.controller';
import { GetBeneficiaryDataUseCase } from './application/use-cases/get-beneficiary-data.use-case';
import { GetBeneficiaryFileUseCase } from './application/use-cases/get-beneficiary-file.use-case';
import { GetHealthPlansUseCase } from './application/use-cases/get-health-plans.use-case';
import { BeneficiaryIntegrationRepository } from './infrastructure/repositories/beneficiary-integration.repository';
import { BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN } from './domain/interfaces/beneficiary-integration.interface';
import { ApiKeyGuard } from './presentation/guards/api-key.guard';
import { User } from 'src/database/entities/user.entity';
import { UserPlan } from 'src/database/entities/user-plan.entity';
import { UserChronicCondition } from 'src/database/entities/user-chronic-condition.entity';
import { UserMedication } from 'src/database/entities/user-medication.entity';
import { HealthPlansModule } from '../health-plans/health-plans.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      UserPlan,
      UserChronicCondition,
      UserMedication,
    ]),
    HealthPlansModule,
  ],
  controllers: [PlatformApiController],
  providers: [
    GetBeneficiaryDataUseCase,
    GetBeneficiaryFileUseCase,
    GetHealthPlansUseCase,
    ApiKeyGuard,
    {
      provide: BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN,
      useClass: BeneficiaryIntegrationRepository,
    },
  ],
  exports: [ApiKeyGuard],
})
export class PlatformApiModule {}
