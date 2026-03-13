// === Existing types (kept as-is) ===
export type { Citizen } from './citizen';
export type { Professional } from './professional';
export type { Municipality, HealthUnit } from './municipality';
export type { Queue, QueuePosition } from './queue';
export type { TriageSession, TriageMessage } from './triage';
export type { Attendance } from './attendance';

// === New clinical intelligence types ===
export type {
  ClinicalIntake,
  ClinicalSummary,
  ExamSuggestion,
  ReferralRecommendation,
} from './clinical-intake';
export type {
  CareJourney,
  CareStep,
  AttendanceRecord,
} from './care-journey';

// === Central Case entity ===
export type { Case, Patient } from './case';

// === Enums ===
export { RiskLevel, riskLevelConfig } from '../enums/risk-level';
export { QueueStatus, queueStatusConfig } from '../enums/queue-status';
export { UserRole, userRoleConfig } from '../enums/user-role';
export { UnitType, unitTypeConfig } from '../enums/unit-type';
export { CareJourneyStatus, careJourneyStatusConfig } from '../enums/care-journey-status';
export { CareStepStatus, careStepStatusConfig } from '../enums/care-step-status';
export { ReferralUrgency, referralUrgencyConfig } from '../enums/referral-urgency';
export { CaseStatus, caseStatusConfig, journeyStatusToCaseStatus } from '../enums/case-status';
