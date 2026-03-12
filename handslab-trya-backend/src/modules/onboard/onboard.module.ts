import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Broker } from '../../database/entities/broker.entity';
import { ChronicCondition } from '../../database/entities/chronic-condition.entity';
import { HealthOperator } from '../../database/entities/health-operator.entity';
import { HealthPlan } from '../../database/entities/health-plan.entity';
import { Medication } from '../../database/entities/medication.entity';
import { User } from '../../database/entities/user.entity';
import { UserChronicCondition } from '../../database/entities/user-chronic-condition.entity';
import { UserMedication } from '../../database/entities/user-medication.entity';
import { UserPlan } from '../../database/entities/user-plan.entity';
import { ChronicConditionsController } from '../onboard/presentation/chronic-conditions.controller';
import { MedicationsController } from '../onboard/presentation/medications.controller';
import { OnboardController } from './presentation/onboard.controller';
import { IChronicConditionsRepository } from './domain/repositories/chronic-conditions.repository';
import { IMedicationsRepository } from './domain/repositories/medications.repository';
import { IOnboardRepository } from './domain/repositories/onboard.repository';
import { TypeOrmChronicConditionsRepository } from './infrastructure/typeorm/repositories/chronic-conditions.repository';
import { TypeOrmMedicationsRepository } from './infrastructure/typeorm/repositories/medications.repository';
import { TypeOrmOnboardRepository } from './infrastructure/typeorm/repositories/onboard.repository';
import { ListChronicConditionsUseCase } from './application/use-cases/list-chronic-conditions.use-case';
import { ListMedicationsUseCase } from './application/use-cases/list-medications.use-case';
import { SaveOnboardUseCase } from './application/use-cases/save-onboard.use-case';
import { SaveOnboardExternalUseCase } from './application/use-cases/save-onboard-external.use-case';
import { UpdateHealthDataUseCase } from './application/use-cases/update-health-data.use-case';
import { ChatApiKeyGuard } from '../../shared/presentation/chat-api-key.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Broker,
      ChronicCondition,
      HealthOperator,
      HealthPlan,
      Medication,
      User,
      UserChronicCondition,
      UserMedication,
      UserPlan,
    ]),
  ],
  providers: [
    ListChronicConditionsUseCase,
    {
      provide: IChronicConditionsRepository,
      useClass: TypeOrmChronicConditionsRepository,
    },
    ListMedicationsUseCase,
    { provide: IMedicationsRepository, useClass: TypeOrmMedicationsRepository },
    SaveOnboardUseCase,
    SaveOnboardExternalUseCase,
    UpdateHealthDataUseCase,
    { provide: IOnboardRepository, useClass: TypeOrmOnboardRepository },
    ChatApiKeyGuard,
  ],
  controllers: [
    ChronicConditionsController,
    MedicationsController,
    OnboardController,
  ],
})
export class OnboardModule {}
