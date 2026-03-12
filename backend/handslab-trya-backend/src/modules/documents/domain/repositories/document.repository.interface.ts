import { MedicalDocument, MedicalDocumentType } from '../../../../database/entities/medical-document.entity';

export interface CreateDocumentData {
  tenantId: string;
  ownerUserId: string;
  memberUserId: string;
  documentType: MedicalDocumentType;
  category: string;
  title: string;
  issueDate: Date;
  validUntil?: Date | null;
  notes?: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  s3Key: string;
}

export interface ListDocumentsFilters {
  tenantId: string;
  ownerUserId: string;
  memberUserId: string;
  documentType?: MedicalDocumentType;
  status?: 'VALID' | 'EXPIRED';
  search?: string;
  issueDateFrom?: Date;
  issueDateTo?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedDocuments {
  data: MedicalDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IDocumentRepository {
  create(data: CreateDocumentData): Promise<MedicalDocument>;
  findById(id: string, tenantId: string): Promise<MedicalDocument | null>;
  findByIdWithOwnerCheck(
    id: string,
    tenantId: string,
    ownerUserId: string,
  ): Promise<MedicalDocument | null>;
  list(filters: ListDocumentsFilters): Promise<PaginatedDocuments>;
  delete(id: string, tenantId: string): Promise<void>;
}

export const DOCUMENT_REPOSITORY_TOKEN = Symbol('IDocumentRepository');
