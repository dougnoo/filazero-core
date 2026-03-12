import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationConfig } from '../../domain/entities/integration-config.entity';
import { EncryptionService } from '../../infrastructure/services/encryption.service';
import { GetIntegrationApiKeyUseCase } from '../../application/use-cases/get-integration-api-key.use-case';
import { ENCRYPTION_SERVICE_TOKEN } from '../../domain/tokens';

// Use Cases
import { CreatePatientUseCase } from './application/use-cases/create-patient.use-case';
import { GeneratePatientMagicLinkUseCase } from './application/use-cases/generate-patient-magic-link.use-case';
import { FilterPatientsUseCase } from './application/use-cases/filter-patients.use-case';
import { GetConsultationHistoryUseCase } from './application/use-cases/get-consultation-history.use-case';
import { GetAttachmentHistoryUseCase } from './application/use-cases/get-attachment-history.use-case';

// Repository Token & Implementation
import { ZELO_REPOSITORY_TOKEN } from './domain/repositories/zelo.repository.token';
import { HttpZeloRepository } from './infrastructure/repositories/http-zelo.repository';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([IntegrationConfig]),
  ],
  providers: [
    {
      provide: ENCRYPTION_SERVICE_TOKEN,
      useClass: EncryptionService,
    },
    GetIntegrationApiKeyUseCase,
    // Repository
    {
      provide: ZELO_REPOSITORY_TOKEN,
      useClass: HttpZeloRepository,
    },

    // Use Cases
    CreatePatientUseCase,
    GeneratePatientMagicLinkUseCase,
    FilterPatientsUseCase,
    GetConsultationHistoryUseCase,
    GetAttachmentHistoryUseCase,
  ],
  exports: [
    ZELO_REPOSITORY_TOKEN,
    CreatePatientUseCase,
    GeneratePatientMagicLinkUseCase,
    FilterPatientsUseCase,
    GetConsultationHistoryUseCase,
    GetAttachmentHistoryUseCase,
    GetIntegrationApiKeyUseCase,
  ],
})
export class ZeloModule {}
