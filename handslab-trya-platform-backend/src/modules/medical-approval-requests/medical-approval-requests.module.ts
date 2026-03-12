import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Infrastructure Entities
import { MedicalApprovalRequestEntity } from './infrastructure/entities/medical-approval-request.entity';
import { ImageAnalysisEntity } from './infrastructure/entities/image-analysis.entity';
import { AttachmentEntity } from './infrastructure/entities/attachment.entity';
import { SymptomEntity } from './infrastructure/entities/symptom.entity';
import { SuggestedExamEntity } from './infrastructure/entities/suggested-exam.entity';
import { CareInstructionEntity } from './infrastructure/entities/care-instruction.entity';

// Repository Token
import { MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN } from './domain/repositories/medical-approval-request.repository.token';

// Repository Implementation
import { TypeORMMedicalApprovalRequestRepository } from './infrastructure/repositories/typeorm-medical-approval-request.repository';

// Use Cases
import { CreateMedicalApprovalRequestUseCase } from './application/use-cases/create-medical-approval-request/create-medical-approval-request.use-case';
import { ListMedicalApprovalRequestsUseCase } from './application/use-cases/list-medical-approval-requests/list-medical-approval-requests.use-case';
import { AssignMedicalApprovalRequestUseCase } from './application/use-cases/assign-medical-approval-request/assign-medical-approval-request.use-case';
import { GetMedicalApprovalRequestUseCase } from './application/use-cases/get-medical-approval-request/get-medical-approval-request.use-case';
import { GetBeneficiaryDetailsUseCase } from './application/use-cases/get-beneficiary-details/get-beneficiary-details.use-case';
import { GetFileUrlUseCase } from './application/use-cases/get-file-url/get-file-url.use-case';
import { ApproveMedicalApprovalRequestUseCase } from './application/use-cases/approve-medical-approval-request/approve-medical-approval-request.use-case';
import { GetPatientHistoryUseCase } from './application/use-cases/get-patient-history/get-patient-history.use-case';

// Beneficiary Integration
import { BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN } from './domain/repositories/beneficiary-integration.repository.token';
import { HttpBeneficiaryIntegrationRepository } from './infrastructure/repositories/http-beneficiary-integration.repository';

// Controllers
import { MedicalApprovalRequestsController } from './presentation/controllers/medical-approval-requests.controller';

// External Modules
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { PrescriptionsModule } from '../prescriptions/prescriptions.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalApprovalRequestEntity,
      ImageAnalysisEntity,
      AttachmentEntity,
      SymptomEntity,
      SuggestedExamEntity,
      CareInstructionEntity,
    ]),
    ConfigModule,
    UsersModule,
    CompaniesModule,
    PrescriptionsModule,
    HttpModule,
  ],
  providers: [
    {
      provide: MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN,
      useClass: TypeORMMedicalApprovalRequestRepository,
    },
    {
      provide: BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN,
      useClass: HttpBeneficiaryIntegrationRepository,
    },
    CreateMedicalApprovalRequestUseCase,
    ListMedicalApprovalRequestsUseCase,
    AssignMedicalApprovalRequestUseCase,
    GetMedicalApprovalRequestUseCase,
    GetBeneficiaryDetailsUseCase,
    GetFileUrlUseCase,
    ApproveMedicalApprovalRequestUseCase,
    GetPatientHistoryUseCase,
  ],
  controllers: [MedicalApprovalRequestsController],
  exports: [MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN],
})
export class MedicalApprovalRequestsModule {}
