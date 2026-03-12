import { RiskLevel } from '../enums/risk-level';

export interface TriageMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface TriageSession {
  id: string;
  citizenId: string;
  messages: TriageMessage[];
  symptoms: string[];
  riskLevel?: RiskLevel;
  priorityScore?: number;
  summary?: string;
  recommendation?: string;
  isComplete: boolean;
  startedAt: string;
  completedAt?: string;
}
