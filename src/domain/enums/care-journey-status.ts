export enum CareJourneyStatus {
  INTAKE = 'INTAKE',
  TRIAGE_COMPLETE = 'TRIAGE_COMPLETE',
  EXAMS_PENDING = 'EXAMS_PENDING',
  EXAMS_COMPLETE = 'EXAMS_COMPLETE',
  REFERRAL_PENDING = 'REFERRAL_PENDING',
  REFERRAL_SCHEDULED = 'REFERRAL_SCHEDULED',
  AWAITING_SPECIALIST = 'AWAITING_SPECIALIST',
  IN_ATTENDANCE = 'IN_ATTENDANCE',
  FOLLOW_UP = 'FOLLOW_UP',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

export const careJourneyStatusConfig: Record<CareJourneyStatus, { label: string; order: number }> = {
  [CareJourneyStatus.INTAKE]: { label: 'Acolhimento', order: 1 },
  [CareJourneyStatus.TRIAGE_COMPLETE]: { label: 'Triagem Concluída', order: 2 },
  [CareJourneyStatus.EXAMS_PENDING]: { label: 'Exames Pendentes', order: 3 },
  [CareJourneyStatus.EXAMS_COMPLETE]: { label: 'Exames Concluídos', order: 4 },
  [CareJourneyStatus.REFERRAL_PENDING]: { label: 'Encaminhamento Pendente', order: 5 },
  [CareJourneyStatus.REFERRAL_SCHEDULED]: { label: 'Encaminhamento Agendado', order: 6 },
  [CareJourneyStatus.AWAITING_SPECIALIST]: { label: 'Aguardando Especialista', order: 7 },
  [CareJourneyStatus.IN_ATTENDANCE]: { label: 'Em Atendimento', order: 8 },
  [CareJourneyStatus.FOLLOW_UP]: { label: 'Acompanhamento', order: 9 },
  [CareJourneyStatus.RESOLVED]: { label: 'Resolvido', order: 10 },
  [CareJourneyStatus.CANCELLED]: { label: 'Cancelado', order: 11 },
};
