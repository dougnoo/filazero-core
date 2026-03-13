/**
 * CaseStatus — Unified global case status across the entire application.
 *
 * Replaces fragmented status tracking with a single, consistent set
 * used by all modules: intake, clinical review, journey, dashboard.
 *
 * Lifecycle: STARTED → IN_TRIAGE → AWAITING_REVIEW → REVIEWED →
 *            EXAMS_REQUESTED → EXAMS_COMPLETED → REFERRED →
 *            SCHEDULED → IN_ATTENDANCE → COMPLETED
 */
export enum CaseStatus {
  STARTED = 'STARTED',
  IN_TRIAGE = 'IN_TRIAGE',
  AWAITING_REVIEW = 'AWAITING_REVIEW',
  REVIEWED = 'REVIEWED',
  EXAMS_REQUESTED = 'EXAMS_REQUESTED',
  EXAMS_COMPLETED = 'EXAMS_COMPLETED',
  REFERRED = 'REFERRED',
  SCHEDULED = 'SCHEDULED',
  IN_ATTENDANCE = 'IN_ATTENDANCE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const caseStatusConfig: Record<CaseStatus, {
  label: string;
  order: number;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  colorClass: string;
}> = {
  [CaseStatus.STARTED]: { label: 'Iniciado', order: 1, variant: 'outline', colorClass: 'text-muted-foreground' },
  [CaseStatus.IN_TRIAGE]: { label: 'Em Triagem', order: 2, variant: 'secondary', colorClass: 'text-secondary' },
  [CaseStatus.AWAITING_REVIEW]: { label: 'Aguardando Revisão', order: 3, variant: 'default', colorClass: 'text-primary' },
  [CaseStatus.REVIEWED]: { label: 'Revisado', order: 4, variant: 'outline', colorClass: 'text-primary' },
  [CaseStatus.EXAMS_REQUESTED]: { label: 'Exames Solicitados', order: 5, variant: 'secondary', colorClass: 'text-secondary' },
  [CaseStatus.EXAMS_COMPLETED]: { label: 'Exames Concluídos', order: 6, variant: 'outline', colorClass: 'text-primary' },
  [CaseStatus.REFERRED]: { label: 'Encaminhado', order: 7, variant: 'default', colorClass: 'text-secondary' },
  [CaseStatus.SCHEDULED]: { label: 'Agendado', order: 8, variant: 'default', colorClass: 'text-primary' },
  [CaseStatus.IN_ATTENDANCE]: { label: 'Em Atendimento', order: 9, variant: 'secondary', colorClass: 'text-secondary' },
  [CaseStatus.COMPLETED]: { label: 'Concluído', order: 10, variant: 'outline', colorClass: 'text-muted-foreground' },
  [CaseStatus.CANCELLED]: { label: 'Cancelado', order: 11, variant: 'destructive', colorClass: 'text-destructive' },
};

/**
 * Maps CareJourneyStatus to the unified CaseStatus.
 * Used during the transition period and for backward compatibility.
 */
export function journeyStatusToCaseStatus(journeyStatus: string): CaseStatus {
  const map: Record<string, CaseStatus> = {
    INTAKE: CaseStatus.STARTED,
    TRIAGE_COMPLETE: CaseStatus.AWAITING_REVIEW,
    EXAMS_PENDING: CaseStatus.EXAMS_REQUESTED,
    EXAMS_COMPLETE: CaseStatus.EXAMS_COMPLETED,
    REFERRAL_PENDING: CaseStatus.AWAITING_REVIEW,
    REFERRAL_SCHEDULED: CaseStatus.SCHEDULED,
    AWAITING_SPECIALIST: CaseStatus.REFERRED,
    IN_ATTENDANCE: CaseStatus.IN_ATTENDANCE,
    FOLLOW_UP: CaseStatus.IN_ATTENDANCE,
    RESOLVED: CaseStatus.COMPLETED,
    CANCELLED: CaseStatus.CANCELLED,
  };
  return map[journeyStatus] ?? CaseStatus.STARTED;
}
