import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { DOCUMENT_REPOSITORY_TOKEN } from '../../domain/repositories/document.repository.interface';
import { DocumentStorageService } from '../../infrastructure/services/document-storage.service';
import { DocumentDownloadDto } from '../dto/document-response.dto';

export interface GetDocumentDownloadInput {
  documentId: string;
  ownerUserId: string;
  tenantId: string;
}

@Injectable()
export class GetDocumentDownloadUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY_TOKEN)
    private readonly documentRepository: IDocumentRepository,
    private readonly storageService: DocumentStorageService,
  ) {}

  async execute(input: GetDocumentDownloadInput): Promise<DocumentDownloadDto> {
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

    const downloadUrl = await this.storageService.generateDownloadUrl(
      document.s3Key,
      document.fileName,
      300,
    );

    return {
      downloadUrl,
      fileName: document.fileName,
    };
  }
}
