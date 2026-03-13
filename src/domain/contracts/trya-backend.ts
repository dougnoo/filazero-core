/**
 * trya-backend REST API Contract — Frontend-side type definitions.
 *
 * These types define the exact request/response shapes expected from the
 * trya-backend NestJS service for clinical review, validation, and care journey.
 *
 * Mapping:
 *   clinical-review-service.ts  →  /api/professional/*
 *   journey-service.ts          →  /api/citizens/*, /api/journeys/*
 *
 * All endpoints require:
 *   - Authorization: Bearer <JWT>
 *   - X-Municipality-Id: <uuid>
 *   - X-Unit-Id: <uuid>  (optional, narrows scope)
 */

import type { RiskLevel } from '../enums/risk-level';
import type { CareJourneyStatus } from '../enums/care-journey-status';
import type { CareStepStatus } from '../enums/care-step-status';
import type { ReferralUrgency } from '../enums/referral-urgency';

// ═══════════════════════════════════════════════════════════════════
// §1 — Clinical Package (Professional Review)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/professional/clinical-packages?status=pending
 * GET /api/professional/clinical-packages  (all)
 *
 * Returns paginated list of clinical packages for the authenticated professional.
 */
export interface ClinicalPackageListParams {
  status?: 'pending' | 'reviewed' | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'priority' | 'date' | 'risk';
  order?: 'asc' | 'desc';
}

export interface ClinicalPackageListResponse {
  data: ClinicalPackageDTO[];
  total: number;
  page: number;
  limit: number;
}

/**
 * GET /api/professional/clinical-packages/:id
 *
 * Returns a full clinical package with intake, summary, exams, and recommendation.
 */
export interface ClinicalPackageDTO {
  journey: JourneyDTO;
  intake: ClinicalIntakeDTO;
}

// ═══════════════════════════════════════════════════════════════════
// §2 — Validation (Professional Actions)
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/professional/validate
 *
 * Submits a medical validation decision on a clinical package.
 */
export interface ValidationRequest {
  journeyId: string;
  action: ValidationActionType;
  notes?: string;
  /** Specific exam IDs to approve/reject (partial approval) */
  modifiedExamIds?: string[];
  /** Override referral specialty if changing recommendation */
  overrideSpecialty?: string;
  /** Override referral urgency */
  overrideUrgency?: ReferralUrgency;
}

export type ValidationActionType =
  | 'APPROVE_EXAMS'
  | 'REJECT_EXAMS'
  | 'APPROVE_REFERRAL'
  | 'REJECT_REFERRAL'
  | 'REQUEST_MORE_INFO'
  | 'RESOLVE_PRIMARY';

export interface ValidationResponse {
  success: boolean;
  journeyId: string;
  /** New journey status after validation */
  newStatus: CareJourneyStatus;
  /** Updated step statuses */
  updatedSteps?: Array<{ stepId: string; status: CareStepStatus }>;
  message?: string;
}

// ═══════════════════════════════════════════════════════════════════
// §3 — Care Journey (Citizen & Professional views)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/citizens/:citizenId/journeys?status=active
 * GET /api/citizens/:citizenId/journeys  (all, including resolved)
 */
export interface JourneyListParams {
  status?: 'active' | 'resolved' | 'all';
}

/**
 * GET /api/journeys/:journeyId
 */
export interface JourneyDTO {
  id: string;
  citizenId: string;
  citizenName: string;
  intakeId: string;
  originUnitId: string;

  chiefComplaint: string;
  riskLevel: RiskLevel;
  priorityScore: number;
  referralUrgency?: ReferralUrgency;
  targetSpecialty?: string;

  status: CareJourneyStatus;
  steps: CareStepDTO[];
  currentStepIndex: number;

  queuePositionId?: string;
  estimatedWaitDays?: number;

  startedAt: string;
  resolvedAt?: string;
  resolution?: JourneyResolution;
}

export type JourneyResolution =
  | 'RESOLVED_PRIMARY'
  | 'RESOLVED_SPECIALIST'
  | 'HOSPITALIZED'
  | 'FOLLOW_UP'
  | 'ABANDONED';

export interface CareStepDTO {
  id: string;
  journeyId: string;
  order: number;
  type: CareStepType;
  label: string;
  description?: string;
  status: CareStepStatus;
  assignedUnitId?: string;
  assignedProfessionalId?: string;
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export type CareStepType =
  | 'INTAKE'
  | 'TRIAGE'
  | 'EXAM_REQUEST'
  | 'EXAM_RESULT'
  | 'REFERRAL_DECISION'
  | 'REGULATION_QUEUE'
  | 'SPECIALIST_PREPARATION'
  | 'ATTENDANCE'
  | 'FOLLOW_UP';

// ═══════════════════════════════════════════════════════════════════
// §4 — Clinical Intake (embedded in ClinicalPackage)
// ═══════════════════════════════════════════════════════════════════

export interface ClinicalIntakeDTO {
  id: string;
  citizenId: string;
  unitId: string;

  chiefComplaint: string;
  symptoms: string[];
  symptomDuration?: string;
  symptomOnset?: string;
  associatedSymptoms?: string[];
  painScale?: number;
  vitalSigns?: VitalSignsDTO;

  currentMedications?: string[];
  allergies?: string[];
  chronicConditions?: string[];
  recentHospitalizations?: string;
  familyHistory?: string[];

  socialVulnerabilityScore?: number;
  hasBasicSanitation?: boolean;
  housingCondition?: 'ADEQUATE' | 'PRECARIOUS' | 'HOMELESS';
  incomeLevel?: 'NO_INCOME' | 'UP_TO_1MW' | '1_TO_3MW' | 'ABOVE_3MW';

  riskLevel: RiskLevel;
  priorityScore: number;
  clinicalSummary?: ClinicalSummaryDTO;
  examSuggestions?: ExamSuggestionDTO[];
  referralRecommendation?: ReferralRecommendationDTO;

  isComplete: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface VitalSignsDTO {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
}

export interface ClinicalSummaryDTO {
  id: string;
  intakeId: string;
  narrative: string;
  structuredFindings: string[];
  suspectedConditions: string[];
  relevantHistory: string;
  riskFactors: string[];
  generatedAt: string;
}

export interface ExamSuggestionDTO {
  id: string;
  intakeId: string;
  examName: string;
  examCode?: string; // SIGTAP
  category: 'LABORATORY' | 'IMAGING' | 'FUNCTIONAL' | 'OTHER';
  priority: 'URGENT' | 'ROUTINE';
  justification: string;
  status: 'SUGGESTED' | 'REQUESTED' | 'COMPLETED' | 'CANCELLED';
  result?: string;
  completedAt?: string;
}

export interface ReferralRecommendationDTO {
  id: string;
  intakeId: string;
  decision: 'RESOLVE_PRIMARY' | 'REFER_SPECIALIST' | 'REFER_EMERGENCY' | 'NEEDS_MORE_DATA';
  confidence: number;
  specialty?: string;
  justification: string;
  requiredExamsBeforeReferral: string[];
  alternativeActions?: string[];
  generatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════
// §5 — State Transition Map
// ═══════════════════════════════════════════════════════════════════

/**
 * Valid state transitions triggered by validation actions.
 * This mirrors the trya-backend orchestration engine.
 *
 * INTAKE → TRIAGE_COMPLETE                (automatic after intake)
 * TRIAGE_COMPLETE → EXAMS_PENDING         (when exams are approved)
 * TRIAGE_COMPLETE → REFERRAL_PENDING      (when no exams needed, referral suggested)
 * TRIAGE_COMPLETE → RESOLVED              (RESOLVE_PRIMARY action)
 * EXAMS_PENDING → EXAMS_COMPLETE          (all exams completed)
 * EXAMS_COMPLETE → REFERRAL_PENDING       (automatic or manual)
 * REFERRAL_PENDING → REFERRAL_SCHEDULED   (referral approved)
 * REFERRAL_PENDING → RESOLVED             (RESOLVE_PRIMARY / REJECT_REFERRAL → resolve)
 * REFERRAL_SCHEDULED → AWAITING_SPECIALIST (regulation queue entered)
 * AWAITING_SPECIALIST → IN_ATTENDANCE     (specialist slot available)
 * IN_ATTENDANCE → FOLLOW_UP              (post-attendance)
 * IN_ATTENDANCE → RESOLVED               (case complete)
 * FOLLOW_UP → RESOLVED                   (discharge)
 * ANY → CANCELLED                         (administrative cancellation)
 */
export const JOURNEY_STATE_TRANSITIONS: Record<CareJourneyStatus, CareJourneyStatus[]> = {
  INTAKE: ['TRIAGE_COMPLETE', 'CANCELLED'] as CareJourneyStatus[],
  TRIAGE_COMPLETE: ['EXAMS_PENDING', 'REFERRAL_PENDING', 'RESOLVED', 'CANCELLED'] as CareJourneyStatus[],
  EXAMS_PENDING: ['EXAMS_COMPLETE', 'CANCELLED'] as CareJourneyStatus[],
  EXAMS_COMPLETE: ['REFERRAL_PENDING', 'RESOLVED', 'CANCELLED'] as CareJourneyStatus[],
  REFERRAL_PENDING: ['REFERRAL_SCHEDULED', 'RESOLVED', 'CANCELLED'] as CareJourneyStatus[],
  REFERRAL_SCHEDULED: ['AWAITING_SPECIALIST', 'CANCELLED'] as CareJourneyStatus[],
  AWAITING_SPECIALIST: ['IN_ATTENDANCE', 'CANCELLED'] as CareJourneyStatus[],
  IN_ATTENDANCE: ['FOLLOW_UP', 'RESOLVED', 'CANCELLED'] as CareJourneyStatus[],
  FOLLOW_UP: ['RESOLVED', 'CANCELLED'] as CareJourneyStatus[],
  RESOLVED: [] as CareJourneyStatus[],
  CANCELLED: [] as CareJourneyStatus[],
} as Record<CareJourneyStatus, CareJourneyStatus[]>;

/**
 * Maps validation actions to expected journey state transitions.
 */
export const VALIDATION_ACTION_EFFECTS: Record<ValidationActionType, {
  description: string;
  expectedTransition?: { from: CareJourneyStatus[]; to: CareJourneyStatus };
}> = {
  APPROVE_EXAMS: {
    description: 'Approves suggested exams → journey moves to EXAMS_PENDING',
    expectedTransition: {
      from: ['TRIAGE_COMPLETE', 'EXAMS_COMPLETE'] as CareJourneyStatus[],
      to: 'EXAMS_PENDING' as CareJourneyStatus,
    },
  },
  REJECT_EXAMS: {
    description: 'Rejects suggested exams → journey stays or moves to REFERRAL_PENDING',
  },
  APPROVE_REFERRAL: {
    description: 'Approves referral → journey moves to REFERRAL_SCHEDULED',
    expectedTransition: {
      from: ['REFERRAL_PENDING'] as CareJourneyStatus[],
      to: 'REFERRAL_SCHEDULED' as CareJourneyStatus,
    },
  },
  REJECT_REFERRAL: {
    description: 'Rejects referral → may resolve at primary or request more info',
  },
  REQUEST_MORE_INFO: {
    description: 'Requests additional clinical information → no status change, triggers notification',
  },
  RESOLVE_PRIMARY: {
    description: 'Resolves case at primary care level → journey moves to RESOLVED',
    expectedTransition: {
      from: ['TRIAGE_COMPLETE', 'EXAMS_COMPLETE', 'REFERRAL_PENDING'] as CareJourneyStatus[],
      to: 'RESOLVED' as CareJourneyStatus,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════
// §6 — Endpoint Reference
// ═══════════════════════════════════════════════════════════════════

/**
 * Endpoint reference for trya-backend integration.
 * These are the exact paths the frontend services will call.
 *
 * Professional Clinical Review:
 *   GET    /api/professional/clinical-packages          → list all packages
 *   GET    /api/professional/clinical-packages?status=X  → filtered list
 *   GET    /api/professional/clinical-packages/:id       → single package
 *   POST   /api/professional/validate                    → submit validation
 *
 * Citizen Journey:
 *   GET    /api/citizens/:citizenId/journeys             → all journeys
 *   GET    /api/citizens/:citizenId/journeys?status=X    → filtered
 *   GET    /api/journeys/:journeyId                      → single journey
 *
 * Clinical Intake (read-only from trya-backend):
 *   GET    /api/intakes/:intakeId                        → intake details
 *
 * Dashboard / Analytics:
 *   GET    /api/manager/dashboard                        → KPIs + metrics (platform-backend)
 */
