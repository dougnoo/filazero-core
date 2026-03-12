export interface Patient {
  id: string;
  name: string;
  affiliation?: string;
  status: string;
  startedAt?: string;
}

export interface Step {
  id: string;
  title: string;
  completed?: boolean;
}

export interface HealthData {
  conditions: string[];
  meds: string[];
  allergies: string[];
}

export type SessionStatus = 'DRAFT' | 'PENDING' | 'COMPLETED';

export interface TriageHistory {
  id: string;
  title: string;
  date: string;
  status?: SessionStatus;
  summary?: string;
  isActive?: boolean;
}

export interface MedicalValidation {
  doctorName: string;
  crm: string;
  status: string;
}

