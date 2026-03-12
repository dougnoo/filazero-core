import {
  MedicalCertificate,
  ValidationResult,
} from '../../../../database/entities/medical-certificate.entity';

export interface IUploadResult {
  fileUrl: string;
  s3Key: string;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  name?: string;
  date?: string;
  status?: string;
}

export interface IMedicalCertificateRepository {
  upload(
    file: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<IUploadResult>;
  save(certificate: Partial<MedicalCertificate>): Promise<MedicalCertificate>;
  update(
    id: string,
    tenantId: string,
    data: Partial<MedicalCertificate>,
  ): Promise<MedicalCertificate>;
  analyzeAsync(
    certificateId: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<void>;
  findPendingAnalysis(limit?: number): Promise<MedicalCertificate[]>;
  findByUserId(
    userId: string,
    tenantId: string,
    page: number,
    limit: number,
    filters?: SearchFilters,
  ): Promise<IPaginatedResult<MedicalCertificate>>;
  findByTenantId(
    tenantId: string,
    page: number,
    limit: number,
    filters?: SearchFilters,
  ): Promise<IPaginatedResult<MedicalCertificate>>;
  findById(id: string, tenantId: string): Promise<MedicalCertificate | null>;
  findByIdWithRelations(
    id: string,
    tenantId: string,
  ): Promise<MedicalCertificate | null>;
  delete(id: string, tenantId: string): Promise<void>;
  generatePresignedUrl(s3Key: string, expiresIn: number): Promise<string>;
}

export const MEDICAL_CERTIFICATE_REPOSITORY_TOKEN =
  'MEDICAL_CERTIFICATE_REPOSITORY_TOKEN';
