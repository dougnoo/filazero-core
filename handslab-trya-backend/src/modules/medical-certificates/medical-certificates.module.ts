import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { MedicalCertificate } from '../../database/entities/medical-certificate.entity';
import { MedicalCertificatesController } from './presentation/controllers/medical-certificates.controller';
import { UploadCertificateUseCase } from './application/use-cases/upload-certificate.use-case';
import { ListCertificatesUseCase } from './application/use-cases/list-certificates.use-case';
import { ListCertificatesHRUseCase } from './application/use-cases/list-certificates-hr.use-case';
import { GetCertificateByIdUseCase } from './application/use-cases/get-certificate-by-id.use-case';
import { GetCertificateByIdHRUseCase } from './application/use-cases/get-certificate-by-id-hr.use-case';
import { DeleteCertificateUseCase } from './application/use-cases/delete-certificate.use-case';
import { UpdateCertificateStatusUseCase } from './application/use-cases/update-certificate-status.use-case';
import { S3MedicalCertificateRepository } from './infrastructure/repositories/s3-medical-certificate.repository';
import { BedrockValidationService } from './infrastructure/services/bedrock-validation.service';
import { BedrockToolExecutorService } from './infrastructure/services/bedrock-tool-executor.service';
import { CertificateAnalysisCronService } from './application/services/certificate-analysis-cron.service';
import { MEDICAL_CERTIFICATE_REPOSITORY_TOKEN } from './domain/interfaces/medical-certificate.repository.interface';
import { PdfLibConverter } from '../chat/infrastructure/converters/pdf-lib.converter';
import { PDF_CONVERTER_TOKEN } from '../chat/domain/ports/pdf-converter.interface';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([MedicalCertificate]),
    HttpModule,
  ],
  controllers: [MedicalCertificatesController],
  providers: [
    UploadCertificateUseCase,
    ListCertificatesUseCase,
    ListCertificatesHRUseCase,
    GetCertificateByIdUseCase,
    GetCertificateByIdHRUseCase,
    DeleteCertificateUseCase,
    UpdateCertificateStatusUseCase,
    BedrockValidationService,
    BedrockToolExecutorService,
    CertificateAnalysisCronService,
    {
      provide: MEDICAL_CERTIFICATE_REPOSITORY_TOKEN,
      useClass: S3MedicalCertificateRepository,
    },
    {
      provide: PDF_CONVERTER_TOKEN,
      useClass: PdfLibConverter,
    },
  ],
  exports: [
    UploadCertificateUseCase,
    ListCertificatesUseCase,
    ListCertificatesHRUseCase,
    GetCertificateByIdUseCase,
    DeleteCertificateUseCase,
  ],
})
export class MedicalCertificatesModule {}
