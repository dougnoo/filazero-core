export enum ReferralUrgency {
  IMMEDIATE = 'IMMEDIATE',
  PRIORITY = 'PRIORITY',
  ROUTINE = 'ROUTINE',
  ELECTIVE = 'ELECTIVE',
}

export const referralUrgencyConfig: Record<ReferralUrgency, { label: string; maxDays: number }> = {
  [ReferralUrgency.IMMEDIATE]: { label: 'Imediato', maxDays: 0 },
  [ReferralUrgency.PRIORITY]: { label: 'Prioritário', maxDays: 7 },
  [ReferralUrgency.ROUTINE]: { label: 'Rotina', maxDays: 30 },
  [ReferralUrgency.ELECTIVE]: { label: 'Eletivo', maxDays: 90 },
};
