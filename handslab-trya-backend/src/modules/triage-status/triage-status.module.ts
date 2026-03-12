import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TriageStatusController } from './presentation/controllers/triage-status.controller';
import { GetTriageValidationStatusUseCase } from './application/use-cases/get-triage-validation-status.use-case';
import { HttpTriageStatusRepository } from './infrastructure/repositories/http-triage-status.repository';
import { TRIAGE_STATUS_REPOSITORY_TOKEN } from './domain/interfaces/triage-status.interface';

@Module({
  imports: [ConfigModule],
  controllers: [TriageStatusController],
  providers: [
    GetTriageValidationStatusUseCase,
    {
      provide: TRIAGE_STATUS_REPOSITORY_TOKEN,
      useClass: HttpTriageStatusRepository,
    },
  ],
  exports: [GetTriageValidationStatusUseCase],
})
export class TriageStatusModule {}
