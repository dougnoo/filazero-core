import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TermVersion } from '../../database/entities/term-version.entity';
import { TermAcceptance } from '../../database/entities/term-acceptance.entity';
import { TermsController } from './presentation/controllers/terms.controller';
import { PublicTermsController } from './presentation/controllers/public-terms.controller';
import { UploadTermUseCase } from './application/use-cases/upload-term/upload-term.use-case';
import { GetLatestTermUseCase } from './application/use-cases/get-latest-term/get-latest-term.use-case';
import { CheckTermAcceptanceUseCase } from './application/use-cases/check-term-acceptance/check-term-acceptance.use-case';
import { AcceptTermUseCase } from './application/use-cases/accept-term/accept-term.use-case';
import { GetTermHistoryUseCase } from './application/use-cases/get-term-history/get-term-history.use-case';
import { GetTermByIdUseCase } from './application/use-cases/get-term-by-id/get-term-by-id.use-case';
import { ActivateTermUseCase } from './application/use-cases/activate-term/activate-term.use-case';
import { ReprocessTermUseCase } from './application/use-cases/reprocess-term/reprocess-term.use-case';
import { TypeOrmTermVersionRepository } from './infrastructure/repositories/typeorm-term-version.repository';
import { TypeOrmTermAcceptanceRepository } from './infrastructure/repositories/typeorm-term-acceptance.repository';
import { S3FileStorageService } from './infrastructure/services/s3-file-storage.service';
import { TERM_VERSION_REPOSITORY_TOKEN } from './domain/repositories/term-version.repository.interface';
import { TERM_ACCEPTANCE_REPOSITORY_TOKEN } from './domain/repositories/term-acceptance.repository.interface';
import { FILE_STORAGE_SERVICE_TOKEN } from './domain/services/file-storage.service.interface';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([TermVersion, TermAcceptance]),
  ],
  controllers: [TermsController, PublicTermsController],
  providers: [
    UploadTermUseCase,
    GetLatestTermUseCase,
    CheckTermAcceptanceUseCase,
    AcceptTermUseCase,
    GetTermHistoryUseCase,
    GetTermByIdUseCase,
    ActivateTermUseCase,
    ReprocessTermUseCase,
    {
      provide: TERM_VERSION_REPOSITORY_TOKEN,
      useClass: TypeOrmTermVersionRepository,
    },
    {
      provide: TERM_ACCEPTANCE_REPOSITORY_TOKEN,
      useClass: TypeOrmTermAcceptanceRepository,
    },
    {
      provide: FILE_STORAGE_SERVICE_TOKEN,
      useClass: S3FileStorageService,
    },
  ],
  exports: [UploadTermUseCase, CheckTermAcceptanceUseCase, AcceptTermUseCase],
})
export class TermsModule {}
