import { Injectable } from '@nestjs/common';
import {
  DOCUMENT_CATALOG,
  DocumentCatalogEntry,
} from '../../domain/catalog/document-catalog';
import { DocumentCatalogResponseDto } from '../dto/document-response.dto';

@Injectable()
export class GetDocumentCatalogUseCase {
  execute(): DocumentCatalogResponseDto {
    return {
      types: DOCUMENT_CATALOG.map((entry: DocumentCatalogEntry) => ({
        type: entry.type,
        label: entry.label,
        categories: entry.categories,
      })),
    };
  }
}
