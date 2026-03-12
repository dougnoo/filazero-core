import { RiskLevel } from '../enums/risk-level';
import { QueueStatus } from '../enums/queue-status';

export interface QueuePosition {
  id: string;
  queueId: string;
  citizenId: string;
  citizenName: string;
  triageSessionId: string;
  riskLevel: RiskLevel;
  priorityScore: number; // 0-100, higher = more priority
  status: QueueStatus;
  position: number;
  estimatedWaitMinutes: number;
  enteredAt: string;
  calledAt?: string;
  attendanceStartedAt?: string;
  completedAt?: string;
}

export interface Queue {
  id: string;
  unitId: string;
  sector: string;
  date: string;
  totalWaiting: number;
  totalInAttendance: number;
  totalCompleted: number;
  avgWaitMinutes: number;
  positions: QueuePosition[];
}
