import { CareJourneyStatus } from '../enums/care-journey-status';
import { CareStepStatus } from '../enums/care-step-status';
import { RiskLevel } from '../enums/risk-level';
import { ReferralUrgency } from '../enums/referral-urgency';

/**
 * CareJourney — The full patient pathway through the public health network.
 * Tracks: intake → triage → exams → referral → specialist → follow-up.
 * Replaces the queue-centric view with a clinical orchestration view.
 */
export interface CareJourney {
  id: string;
  citizenId: string;
  citizenName: string;
  intakeId: string;
  originUnitId: string; // UBS where journey started

  // Clinical context (denormalized for dashboard display)
  chiefComplaint: string;
  riskLevel: RiskLevel;
  priorityScore: number;
  referralUrgency?: ReferralUrgency;
  targetSpecialty?: string;

  // Journey state
  status: CareJourneyStatus;
  steps: CareStep[];
  currentStepIndex: number;

  // Regulation queue (infrastructure — only when referral is needed)
  queuePositionId?: string;
  estimatedWaitDays?: number;

  // Lifecycle
  startedAt: string;
  resolvedAt?: string;
  resolution?: 'RESOLVED_PRIMARY' | 'RESOLVED_SPECIALIST' | 'HOSPITALIZED' | 'FOLLOW_UP' | 'ABANDONED';
}

/**
 * CareStep — A discrete step in the patient's care journey.
 */
export interface CareStep {
  id: string;
  journeyId: string;
  order: number;
  type:
    | 'INTAKE'
    | 'TRIAGE'
    | 'EXAM_REQUEST'
    | 'EXAM_RESULT'
    | 'REFERRAL_DECISION'
    | 'REGULATION_QUEUE'
    | 'SPECIALIST_PREPARATION'
    | 'ATTENDANCE'
    | 'FOLLOW_UP';
  label: string;
  description?: string;
  status: CareStepStatus;
  assignedUnitId?: string;
  assignedProfessionalId?: string;
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>; // Flexible payload per step type
}

/**
 * AttendanceRecord — Extended from existing Attendance type.
 * Adds clinical intelligence fields for the professional's workflow.
 */
export interface AttendanceRecord {
  id: string;
  journeyId: string;
  citizenId: string;
  professionalId: string;
  unitId: string;
  intakeId: string;

  // Clinical package available to the professional
  clinicalSummaryAvailable: boolean;
  examResultsAvailable: boolean;
  aiRecommendationAvailable: boolean;

  // Attendance
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'REFERRED' | 'NO_SHOW';
  notes?: string;
  outcome?: 'RESOLVED' | 'FOLLOW_UP_NEEDED' | 'REFERRED_SPECIALIST' | 'REFERRED_HOSPITAL';
  referredToSpecialty?: string;
  followUpDate?: string;

  // Lifecycle
  scheduledAt?: string;
  startedAt: string;
  completedAt?: string;
}
