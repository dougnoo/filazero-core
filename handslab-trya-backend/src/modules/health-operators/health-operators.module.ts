import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthOperator } from '../../database/entities/health-operator.entity';
import { HealthOperatorsController } from './presentation/controllers/health-operators.controller';
import { ListHealthOperatorsUseCase } from './application/use-cases/list-health-operators.use-case';
import { CreateHealthOperatorUseCase } from './application/use-cases/create-health-operator.use-case';
import { IHealthOperatorsRepository } from './domain/repositories/health-operators.repository';
import { TypeOrmHealthOperatorsRepository } from './infrastructure/typeorm/repositories/health-operators.repository';
import { HEALTH_OPERATORS_REPOSITORY_TOKEN } from '../user-management/domain/services/service.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([HealthOperator])],
  providers: [
    ListHealthOperatorsUseCase,
    CreateHealthOperatorUseCase,
    {
      provide: IHealthOperatorsRepository,
      useClass: TypeOrmHealthOperatorsRepository,
    },
    {
      provide: HEALTH_OPERATORS_REPOSITORY_TOKEN,
      useClass: TypeOrmHealthOperatorsRepository,
    },
  ],
  controllers: [HealthOperatorsController],
  exports: [
    ListHealthOperatorsUseCase,
    CreateHealthOperatorUseCase,
    IHealthOperatorsRepository,
    HEALTH_OPERATORS_REPOSITORY_TOKEN,
  ],
})
export class HealthOperatorsModule {}
