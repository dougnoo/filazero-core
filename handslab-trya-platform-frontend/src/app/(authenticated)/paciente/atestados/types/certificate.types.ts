export enum CertificateStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ValidationResult {
  VALID = "VALID",
  WARNING = "WARNING",
  INVALID = "INVALID",
}

export interface Certificate {
  id: string;
  fileName: string;
  fileUrl: string;
  status: CertificateStatus;
  createdAt: string;
}

export interface CertificateDetail extends Certificate {
  mimeType: string;
  fileSize: number;
  analysisStatus?: string;
  confidenceScore?: number;
  aiConclusion?: string;
  validations?: {
    crm?: { result: ValidationResult | string; observation?: string };
    authenticity?: { result: ValidationResult | string; observation?: string };
    signature?: { result: ValidationResult | string; observation?: string };
    date?: { result: ValidationResult | string; observation?: string };
    legibility?: { result: ValidationResult | string; observation?: string };
    clinic?: { result: ValidationResult | string; observation?: string };
    fraud?: { result: ValidationResult | string; observation?: string };
  };
  analyzedAt?: string;
  updatedAt: string;
}

export interface PaginatedCertificates {
  data: Certificate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Retorna a configuração de estilo para um status de certificado
 */
export const getCertificateStatusConfig = (status: CertificateStatus) => {
  switch (status) {
    case CertificateStatus.APPROVED:
      return {
        label: "Aprovado",
        bgcolor: "#E8F5E9",
        color: "#2E7D32",
      };
    case CertificateStatus.PENDING:
      return {
        label: "Em análise",
        bgcolor: "#E3F2FD",
        color: "#1976D2",
      };
    case CertificateStatus.REJECTED:
      return {
        label: "Reprovado",
        bgcolor: "#FFEBEE",
        color: "#C62828",
      };
    default:
      return {
        label: "Desconhecido",
        bgcolor: "#E0E0E0",
        color: "#424242",
      };
  }
};

