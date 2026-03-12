import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import type { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { DOCUMENT_REPOSITORY_TOKEN } from '../../domain/repositories/document.repository.interface';
import { DocumentStorageService } from '../../infrastructure/services/document-storage.service';
// import { OpenSearchService } from '../../infrastructure/services/opensearch.service';
import { IAuditRepository } from '../../../../shared/domain/repositories/audit.repository.interface';
import { AuditEventType } from '../../../../database/entities/audit-event.entity';
import { TimelineService } from '../../../timeline/application/services/timeline.service';

export interface DeleteDocumentInput {
  documentId: string;
  ownerUserId: string;
  tenantId: string;
}

export interface IDocumentEventHook {
  onDocumentDeleted(payload: {
    documentId: string;
    ownerUserId: string;
    memberUserId: string;
    tenantId: string;
  }): Promise<void>;
}

export const DOCUMENT_EVENT_HOOK_TOKEN = Symbol('IDocumentEventHook');

@Injectable()
export class DeleteDocumentUseCase {
  private readonly logger = new Logger(DeleteDocumentUseCase.name);

  constructor(
    @Inject(DOCUMENT_REPOSITORY_TOKEN)
    private readonly documentRepository: IDocumentRepository,
    private readonly storageService: DocumentStorageService,
    // private readonly openSearchService: OpenSearchService,
    private readonly timelineService: TimelineService,
    private readonly auditRepository: IAuditRepository,
    @Inject(DOCUMENT_EVENT_HOOK_TOKEN)
    private readonly eventHook: IDocumentEventHook | null,
  ) {}

  async execute(input: DeleteDocumentInput): Promise<void> {
    const { documentId, ownerUserId, tenantId } = input;

    const document = await this.documentRepository.findByIdWithOwnerCheck(
      documentId,
      tenantId,
      ownerUserId,
    );

    if (!document) {
      const exists = await this.documentRepository.findById(
        documentId,
        tenantId,
      );
      if (exists) {
        throw new ForbiddenException(
          'Você não tem permissão para remover este documento',
        );
      }
      throw new NotFoundException('Documento não encontrado');
    }

    await this.storageService.delete(document.s3Key);
    await this.documentRepository.delete(documentId, tenantId);

    // if (this.openSearchService.isEnabled()) {
    //   await this.openSearchService.removeDocument(documentId);
    // }

    await this.timelineService.removeDocumentEvents(documentId);

    await this.auditRepository.create({
      eventType: AuditEventType.DOCUMENT_DELETED,
      entityType: 'medical_documents',
      entityId: documentId,
      userId: ownerUserId,
      payload: {
        documentType: document.documentType,
        category: document.category,
        memberUserId: document.memberUserId,
        fileName: document.fileName,
      },
    });

    if (this.eventHook) {
      try {
        await this.eventHook.onDocumentDeleted({
          documentId,
          ownerUserId,
          memberUserId: document.memberUserId,
          tenantId,
        });
      } catch (error) {
        this.logger.error(
          `Erro ao executar event hook para documento ${documentId}`,
          error,
        );
      }
    }

    this.logger.log(
      `Documento ${documentId} removido pelo usuário ${ownerUserId}`,
    );
  }
}
