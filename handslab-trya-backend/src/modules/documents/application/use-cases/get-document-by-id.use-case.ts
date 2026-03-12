import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { DOCUMENT_REPOSITORY_TOKEN } from '../../domain/repositories/document.repository.interface';
import { DocumentStorageService } from '../../infrastructure/services/document-storage.service';
import { DocumentDetailDto } from '../dto/document-response.dto';
import { DocumentStatus } from '../../../../database/entities/medical-document.entity';
import { getDocumentTypeLabel } from '../../domain/catalog/document-catalog';

export interface GetDocumentInput {
  documentId: string;
  ownerUserId: string;
  tenantId: string;
}

@Injectable()
export class GetDocumentByIdUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY_TOKEN)
    private readonly documentRepository: IDocumentRepository,
    private readonly storageService: DocumentStorageService,
  ) {}

  async execute(input: GetDocumentInput): Promise<DocumentDetailDto> {
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
          'Você não tem permissão para acessar este documento',
        );
      }
      throw new NotFoundException('Documento não encontrado');
    }

    let viewUrl = '';
    if (document.s3Key) {
      viewUrl = await this.storageService.generatePresignedUrl(
        document.s3Key,
        300,
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validUntilDate = document.validUntil
      ? new Date(document.validUntil)
      : null;
    const issueDateObj = new Date(document.issueDate);
    const createdAtObj = new Date(document.createdAt);

    const status =
      validUntilDate && validUntilDate < today
        ? DocumentStatus.EXPIRED
        : DocumentStatus.VALID;

    return {
      id: document.id,
      documentType: document.documentType,
      documentTypeLabel: getDocumentTypeLabel(document.documentType),
      category: document.category,
      title: document.title,
      memberName: document.member?.name || '',
      memberUserId: document.memberUserId,
      issueDate: issueDateObj.toISOString().split('T')[0],
      validUntil: validUntilDate
        ? validUntilDate.toISOString().split('T')[0]
        : null,
      status,
      viewUrl,
      createdAt: createdAtObj.toISOString(),
      notes: document.notes,
      fileName: document.fileName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
    };
  }
}
