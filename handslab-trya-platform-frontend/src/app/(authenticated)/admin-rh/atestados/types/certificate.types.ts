export type CertificateStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface MedicalCertificate {
  id: string;
  fileName: string;
  fileUrl: string;
  status: CertificateStatus;
  beneficiaryName: string;
  beneficiaryCpf: string;
  tenantName?: string;
  planName?: string;
  createdAt: string;
}

export interface CertificateFilters {
  name?: string;
  date?: string;
  status?: CertificateStatus;
}

export interface CertificateListResponse {
  data: MedicalCertificate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ValidationResult {
  result: string;
  observation: string;
}

export interface CertificateDetail {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  status: CertificateStatus;
  analysisStatus: string;
  confidenceScore: number;
  aiConclusion: string;
  validations: {
    crm: ValidationResult;
    authenticity: ValidationResult;
    signature: ValidationResult;
    date: ValidationResult;
    legibility: ValidationResult;
    clinic: ValidationResult;
    fraud: ValidationResult;
  };
  beneficiary: {
    name: string;
    cpf: string;
    tenantName?: string;
    planName?: string;
  };
  analyzedAt: string;
  createdAt: string;
  updatedAt: string;
}
