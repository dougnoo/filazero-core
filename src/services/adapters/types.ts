/**
 * Service Adapter Interfaces — Phase 5: Backend Integration Preparation.
 *
 * These interfaces define the contracts that both Mock and API implementations
 * must satisfy. The factory in ./factory.ts selects the correct implementation
 * based on DEMO_MODE and granular feature flags.
 *
 * ─── Entity Mapping ────────────────────────────────────────────────
 *
 * Frontend Entity    → Backend Endpoint (trya-backend / platform-backend)
 * ─────────────────────────────────────────────────────────────────────
 * Case               → GET  /api/cases, GET /api/cases/:id
 * Patient            → embedded in Case (denormalized)
 * Intake             → POST /api/intakes, GET /api/intakes/:id
 * Journey            → GET  /api/citizens/:id/journeys, GET /api/journeys/:id
 * ClinicalPackage    → GET  /api/professional/clinical-packages
 * Validation         → POST /api/professional/validate
 * Referral           → embedded in ValidationRequest (action-based)
 * Exam               → embedded in ClinicalIntake.examSuggestions
 * Dashboard          → GET  /api/manager/dashboard
 *
 * ─── Auth Headers (injected by api-client.ts) ──────────────────────
 *   Authorization: Bearer <JWT>
 *   X-Municipality-Id: <uuid>
 *   X-Unit-Id: <uuid>
 */

import type { Case } from '@/domain/types/case';
import type { CareJourney } from '@/domain/types/care-journey';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { TriageMessage } from '@/domain/types/triage';
import type {
  ValidationRequest,
  ValidationResponse,
  ClinicalPackageListParams,
  JourneyListParams,
} from '@/domain/contracts/trya-backend';
import type {
  DashboardFilters,
  DashboardResponse,
  KPIsResponse,
  BottleneckDTO,
  WeeklyTrendDTO,
} from '@/domain/contracts/platform-backend';
import type { CaseFilters } from '@/services/case-service';
import type { ClinicalPackage } from '@/services/clinical-review-service';
import type { IntakePhase } from '@/services/intake-service';
import type { CaseStatus } from '@/domain/enums/case-status';

// ═══════════════════════════════════════════════════════════════════
// §1 — Case Service Adapter
// ═══════════════════════════════════════════════════════════════════

/**
 * ICaseService — Central case CRUD and queries.
 *
 * Backend: trya-backend
 * Endpoints:
 *   GET  /api/cases              → list with filters
 *   GET  /api/cases/:id          → single case
 *   GET  /api/cases/counts       → counts by status
 *   PATCH /api/cases/:id/status  → update status
 *   PATCH /api/cases/:id/priority → update priority
 */
export interface ICaseService {
  getCases(filters?: CaseFilters): Promise<Case[]>;
  getCaseById(caseId: string): Promise<Case | null>;
  getCaseCountsByStatus(): Promise<Record<CaseStatus, number>>;
}

// ═══════════════════════════════════════════════════════════════════
// §2 — Intake Service Adapter
// ═══════════════════════════════════════════════════════════════════

/**
 * IIntakeService — Clinical intake conversation and result generation.
 *
 * Backend: chat-backend (WebSocket + HTTP)
 * Endpoints:
 *   POST /api/clinical-chat      → send message (streaming SSE)
 *   POST /api/clinical-result    → generate clinical result from conversation
 *
 * The chat-backend delegates to LangChain agents:
 *   - OnboardingAgent: greeting + identification
 *   - SymptomAgent: structured symptom collection
 *   - ResultAgent: clinical summary + risk classification
 */
export interface IIntakeService {
  sendMessage(
    intakeId: string,
    userMessage: string,
    currentPhase: IntakePhase,
  ): Promise<{ reply: TriageMessage; nextPhase: IntakePhase }>;

  generateResult(
    intakeId: string,
    messages: TriageMessage[],
  ): Promise<ClinicalIntake>;

  getGreetingMessage(): TriageMessage;
}

// ═══════════════════════════════════════════════════════════════════
// §3 — Journey Service Adapter
// ═══════════════════════════════════════════════════════════════════

/**
 * IJourneyService — Citizen care journey tracking.
 *
 * Backend: trya-backend
 * Endpoints:
 *   GET /api/citizens/:citizenId/journeys          → list (with optional status filter)
 *   GET /api/journeys/:journeyId                   → single journey
 *   GET /api/intakes/:intakeId                     → intake details for a journey
 */
export interface IJourneyService {
  getCitizenJourneys(
    citizenId: string,
    params?: JourneyListParams,
  ): Promise<CareJourney[]>;

  getJourneyById(journeyId: string): Promise<CareJourney | null>;

  getIntakeForJourney(intakeId: string): Promise<ClinicalIntake | null>;

  getCitizenJourneyHistory(citizenId: string): Promise<CareJourney[]>;
}

// ═══════════════════════════════════════════════════════════════════
// §4 — Clinical Review Service Adapter
// ═══════════════════════════════════════════════════════════════════

/**
 * IClinicalReviewService — Professional clinical package review & validation.
 *
 * Backend: trya-backend
 * Endpoints:
 *   GET  /api/professional/clinical-packages           → list (pending/all)
 *   GET  /api/professional/clinical-packages/:id       → single package
 *   POST /api/professional/validate                    → submit validation action
 *
 * Validation actions (see ValidationActionType):
 *   APPROVE_EXAMS, REJECT_EXAMS, APPROVE_REFERRAL, REJECT_REFERRAL,
 *   REQUEST_MORE_INFO, RESOLVE_PRIMARY, CHANGE_PRIORITY, REDIRECT_CASE
 */
export interface IClinicalReviewService {
  getPendingPackages(
    params?: Omit<ClinicalPackageListParams, 'status'>,
  ): Promise<ClinicalPackage[]>;

  getAllPackages(
    params?: ClinicalPackageListParams,
  ): Promise<ClinicalPackage[]>;

  getPackageById(journeyId: string): Promise<ClinicalPackage | null>;

  submitValidation(payload: ValidationRequest): Promise<ValidationResponse>;
}

// ═══════════════════════════════════════════════════════════════════
// §5 — Dashboard Service Adapter
// ═══════════════════════════════════════════════════════════════════

/**
 * IDashboardService — Manager operational intelligence.
 *
 * Backend: platform-backend
 * Endpoints:
 *   GET /api/manager/dashboard                → full aggregated dashboard
 *   GET /api/manager/dashboard/kpis           → KPIs only
 *   GET /api/manager/dashboard/bottlenecks    → bottlenecks only
 *   GET /api/manager/dashboard/weekly-trend   → weekly trend chart data
 */
export interface IDashboardService {
  fetchDashboard(filters?: DashboardFilters): Promise<DashboardResponse>;
  fetchKPIs(filters?: DashboardFilters): Promise<KPIsResponse>;
  fetchBottlenecks(filters?: DashboardFilters): Promise<BottleneckDTO[]>;
  fetchWeeklyTrend(filters?: DashboardFilters, weeks?: number): Promise<WeeklyTrendDTO[]>;
}

// ═══════════════════════════════════════════════════════════════════
// §6 — Auth Service Adapter (already implemented in auth-service.ts)
// ═══════════════════════════════════════════════════════════════════

// Re-exported for completeness. See src/services/auth-service.ts → IAuthService.
export type { IAuthService, AppSession, AppUser } from '@/services/auth-service';
