export enum AlertType {
  DOCUMENT_EXPIRING = 'DOCUMENT_EXPIRING',
  DOCUMENT_EXPIRED = 'DOCUMENT_EXPIRED',
  MISSING_VACCINATION = 'MISSING_VACCINATION',
  MISSING_EXAM = 'MISSING_EXAM',
  MISSING_OBLIGATION = 'MISSING_OBLIGATION',
}

export enum AlertPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface AlertPayload {
  type: AlertType;
  message: string;
  priority: AlertPriority;
  category?: string;
  documentType?: string;
  expirationDaysLeft?: number;
  entityId?: string; // reference to document or entity that triggered the alert
}

export interface AlertContext {
  memberUserId: string;
  memberName: string;
  age?: number;
  gender?: string;
  [key: string]: unknown;
}
