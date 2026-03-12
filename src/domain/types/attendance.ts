export interface Attendance {
  id: string;
  citizenId: string;
  professionalId: string;
  unitId: string;
  triageSessionId: string;
  queuePositionId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'REFERRED';
  notes?: string;
  referredTo?: string;
  startedAt: string;
  completedAt?: string;
}
