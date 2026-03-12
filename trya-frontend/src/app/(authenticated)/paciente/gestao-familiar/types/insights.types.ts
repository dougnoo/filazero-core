import { MedicalDocumentType } from "../documentos/types/document.types";


export interface ExpiringDocument {
  id: string;
  title: string;
  documentType: MedicalDocumentType;
  category: string;
  memberName: string;
  memberUserId: string;
  validUntil: string;
  daysUntilExpiration: number;
}

export interface DocumentStatistics {
  totalDocuments: number;
  validDocuments: number;
  expiredDocuments: number;
  expiringInNext30Days: number;
  byType: Record<MedicalDocumentType, number>;
}

export interface MemberHealthSummary {
  memberId: string;
  memberName: string;
  totalDocuments: number;
  lastDocumentDate: string | null;
  nextExpiration: string | null;
  hasRecentVaccination: boolean;
  hasRecentExam: boolean;
}

export type AlertType = 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING_DOCUMENT' | 'REMINDER';
export type AlertPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface HealthAlert {
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  documentId?: string;
  memberUserId?: string;
  actionLabel: string;
  actionRoute: string;
}

export interface HealthInsights {
  alerts: HealthAlert[];
  expiringDocuments: ExpiringDocument[];
  statistics: DocumentStatistics;
  memberSummaries: MemberHealthSummary[];
}
