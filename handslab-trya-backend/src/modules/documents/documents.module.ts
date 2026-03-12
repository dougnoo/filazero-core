import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MedicalDocument } from '../../database/entities/medical-document.entity';
import { User } from '../../database/entities/user.entity';
import { DocumentsController } from './presentation/controllers/documents.controller';
import { TypeOrmDocumentRepository } from './infrastructure/repositories/typeorm-document.repository';
import { DOCUMENT_REPOSITORY_TOKEN } from './domain/repositories/document.repository.interface';
import { DocumentStorageService } from './infrastructure/services/document-storage.service';
// import { OpenSearchService } from './infrastructure/services/opensearch.service';
import { UploadDocumentUseCase } from './application/use-cases/upload-document.use-case';
import { ListDocumentsUseCase } from './application/use-cases/list-documents.use-case';
import { GetDocumentByIdUseCase } from './application/use-cases/get-document-by-id.use-case';
import { GetDocumentDownloadUseCase } from './application/use-cases/get-document-download.use-case';
import { DeleteDocumentUseCase, DOCUMENT_EVENT_HOOK_TOKEN } from './application/use-cases/delete-document.use-case';
import { GetFamilyMembersUseCase } from './application/use-cases/get-family-members.use-case';
import { GetDocumentCatalogUseCase } from './application/use-cases/get-document-catalog.use-case';
import { PrimaryBeneficiaryGuard } from './presentation/guards/primary-beneficiary.guard';
import { SharedModule } from '../../shared/shared.module';
import { TimelineModule } from '../timeline/timeline.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalDocument, User]),
    ConfigModule,
    SharedModule,
    forwardRef(() => TimelineModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [DocumentsController],
  providers: [
    {
      provide: DOCUMENT_REPOSITORY_TOKEN,
      useClass: TypeOrmDocumentRepository,
    },
    {
      provide: DOCUMENT_EVENT_HOOK_TOKEN,
      useValue: null,
    },
    DocumentStorageService,
    // OpenSearchService,
    UploadDocumentUseCase,
    ListDocumentsUseCase,
    GetDocumentByIdUseCase,
    GetDocumentDownloadUseCase,
    DeleteDocumentUseCase,
    GetFamilyMembersUseCase,
    GetDocumentCatalogUseCase,
    PrimaryBeneficiaryGuard,
  ],
  exports: [DOCUMENT_REPOSITORY_TOKEN, DocumentStorageService /* , OpenSearchService */],
})
export class DocumentsModule {}
