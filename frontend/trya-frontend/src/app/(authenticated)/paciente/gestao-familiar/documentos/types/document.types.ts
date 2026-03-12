export enum MedicalDocumentType {
  LAB_EXAM = "LAB_EXAM",
  IMAGING_EXAM = "IMAGING_EXAM",
  REPORT = "REPORT",
  VACCINATION = "VACCINATION",
  CLINICAL_FILE = "CLINICAL_FILE",
  PRESCRIPTION = "PRESCRIPTION",
}

export enum DocumentStatus {
  VALID = "VALID",
  EXPIRED = "EXPIRED",
}

export interface FamilyMember {
  id: string;
  name: string;
  type: string;
}

export interface FamilyMembersResponse {
  members: FamilyMember[];
}

export interface DocumentCatalogEntry {
  type: MedicalDocumentType;
  label: string;
  categories: string[];
}

export interface DocumentCatalogResponse {
  types: DocumentCatalogEntry[];
}

export interface Document {
  id: string;
  documentType: MedicalDocumentType;
  documentTypeLabel: string;
  category: string;
  title: string;
  memberName: string;
  memberUserId: string;
  issueDate: string;
  validUntil?: string | null;
  status: DocumentStatus;
  viewUrl: string;
  createdAt: string;
}

export interface DocumentDetail extends Document {
  notes?: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface DocumentDownload {
  downloadUrl: string;
  fileName: string;
}

export interface PaginatedDocuments {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListDocumentsParams {
  memberUserId: string;
  type?: MedicalDocumentType;
  status?: DocumentStatus;
  q?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  page?: number;
  limit?: number;
}

export interface UploadDocumentData {
  file: File;
  memberUserId: string;
  documentType: MedicalDocumentType;
  category: string;
  title: string;
  issueDate: string;
  validUntil?: string;
  notes?: string;
}
