import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ZeloModule } from './telemedicine/zelo/zelo.module';
import { UserManagementModule } from '../user-management/user-management.module';
import { IntegrationConfig } from './domain/entities/integration-config.entity';

// Controllers
import { TelemedicineController } from './presentation/telemedicine.controller';

// Use Cases
import { ListIntegrationsUseCase } from './application/use-cases/list-integrations.use-case';
import { CreateIntegrationUseCase } from './application/use-cases/create-integration.use-case';
import { GetIntegrationApiKeyUseCase } from './application/use-cases/get-integration-api-key.use-case';
import { GenerateMagicLinkUseCase } from './application/use-cases/generate-magic-link.use-case';
import { GetConsultationHistoryUseCase } from './application/use-cases/get-consultation-history.use-case';

// Strategies
import { TelemedicineStrategyFactory } from './telemedicine/strategies/telemedicine-strategy.factory';
import { ZeloTelemedicineStrategy } from './telemedicine/strategies/zelo-telemedicine.strategy';

// Infrastructure
import { IntegrationConfigRepository } from './infrastructure/repositories/integration-config.repository';
import { ZeloTelemedicineAdapter } from './infrastructure/adapters/zelo-telemedicine.adapter';
import { EncryptionService } from './infrastructure/services/encryption.service';

// Tokens
import { TELEMEDICINE_REPOSITORY_TOKEN } from './domain/repositories/integration.repository.token';
import {
  INTEGRATION_REPOSITORY_TOKEN,
  ENCRYPTION_SERVICE_TOKEN,
} from './domain/tokens';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([IntegrationConfig]),
    ZeloModule,
    UserManagementModule,
  ],
  controllers: [TelemedicineController],
  providers: [
    // Repositories
    {
      provide: INTEGRATION_REPOSITORY_TOKEN,
      useClass: IntegrationConfigRepository,
    },

    // Adapters
    {
      provide: TELEMEDICINE_REPOSITORY_TOKEN,
      useClass: ZeloTelemedicineAdapter,
    },

    // Services
    {
      provide: ENCRYPTION_SERVICE_TOKEN,
      useClass: EncryptionService,
    },

    // Strategies
    ZeloTelemedicineStrategy,
    TelemedicineStrategyFactory,

    // Use Cases
    ListIntegrationsUseCase,
    CreateIntegrationUseCase,
    GetIntegrationApiKeyUseCase,
    GenerateMagicLinkUseCase,
    GetConsultationHistoryUseCase,
  ],
  exports: [ListIntegrationsUseCase],
})
export class IntegrationsModule {}
