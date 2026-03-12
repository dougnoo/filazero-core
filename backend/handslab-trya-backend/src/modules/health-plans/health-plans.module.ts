import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthPlan } from '../../database/entities/health-plan.entity';
import { HealthPlansController } from './presentation/controllers/health-plans.controller';
import { ListHealthPlansUseCase } from './application/use-cases/list-health-plans.use-case';
import { IHealthPlansRepository } from './domain/repositories/health-plans.repository';
import { TypeOrmHealthPlansRepository } from './infrastructure/typeorm/repositories/health-plans.repository';
import { HEALTH_PLANS_REPOSITORY_TOKEN } from '../user-management/domain/services/service.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([HealthPlan])],
  providers: [
    ListHealthPlansUseCase,
    { provide: IHealthPlansRepository, useClass: TypeOrmHealthPlansRepository },
    {
      provide: HEALTH_PLANS_REPOSITORY_TOKEN,
      useClass: TypeOrmHealthPlansRepository,
    },
  ],
  controllers: [HealthPlansController],
  exports: [
    ListHealthPlansUseCase,
    IHealthPlansRepository,
    HEALTH_PLANS_REPOSITORY_TOKEN,
  ],
})
export class HealthPlansModule {}
