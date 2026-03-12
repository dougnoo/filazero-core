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

export interface TriageHistory {
  id: string;
  title: string;
  date: string;
}

export interface MedicalValidation {
  doctorName: string;
  crm: string;
  status: string;
}

