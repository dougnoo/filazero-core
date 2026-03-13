/**
 * Service Adapter Interfaces — Phase 6: Real Backend Alignment.
 *
 * Interfaces are now grouped by their target Trya backend module:
 *
 * ┌─────────────────────────┬────────────────────────────────────────┐
 * │ Backend Module          │ Service Interfaces                     │
 * ├─────────────────────────┼────────────────────────────────────────┤
 * │ trya-backend            │ ICaseService, IPatientService,         │
 * │ (handslab-trya-backend) │ IJourneyService, IClinicalReviewService,│
 * │                         │ IExamService                           │
 * ├─────────────────────────┼────────────────────────────────────────┤
 * │ chat-backend            │ IIntakeService                         │
 * │ (handslab-trya-chat-    │ (WebSocket session + HTTP endpoints)   │
 * │  backend)               │                                        │
 * ├─────────────────────────┼────────────────────────────────────────┤
 * │ chat-agents             │ IClinicalSummaryService,               │
 * │ (handslab-trya-chat-    │ IReferralService                       │
 * │  agents)                │ (AI inference — called via chat-backend)│
 * ├─────────────────────────┼────────────────────────────────────────┤
 * │ platform-backend        │ IDashboardService                      │
 * │ (handslab-trya-platform)│ (NOT used in MVP — manager analytics)  │
 * └─────────────────────────┴────────────────────────────────────────┘
 *
 * ─── Auth Headers (injected by api-client.ts) ──────────────────────
 *   Authorization: Bearer <JWT>
 *   X-Municipality-Id: <uuid>
 *   X-Unit-Id: <uuid>
 */

import type { Case, Patient } from '@/domain/types/case';
import type { CareJourney } from '@/domain/types/care-journey';
import type {
  ClinicalIntake,
  ClinicalSummary,
  ExamSuggestion,
  ReferralRecommendation,
} from '@/domain/types/clinical-intake';
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
// §1 — trya-backend: Case Service
// Backend: handslab-trya-backend
// Endpoints: GET /api/cases, GET /api/cases/:id, GET /api/cases/counts
// ═══════════════════════════════════════════════════════════════════

export interface ICaseService {
  getCases(filters?: CaseFilters): Promise<Case[]>;
  getCaseById(caseId: string): Promise<Case | null>;
  getCaseCountsByStatus(): Promise<Record<CaseStatus, number>>;
}

// ═══════════════════════════════════════════════════════════════════
// §2 — trya-backend: Patient Service
// Backend: handslab-trya-backend
// Endpoints:
//   GET  /api/patients/:id            → patient details
//   GET  /api/patients/search?cpf=X   → lookup by CPF
//   GET  /api/patients/:id/history    → clinical history
// ═══════════════════════════════════════════════════════════════════

export interface IPatientService {
  getPatientById(patientId: string): Promise<Patient | null>;
  searchPatientByCPF(cpf: string): Promise<Patient | null>;
  getPatientClinicalHistory(patientId: string): Promise<ClinicalIntake[]>;
}

// ═══════════════════════════════════════════════════════════════════
// §3 — chat-backend: Intake Service
// Backend: handslab-trya-chat-backend (WebSocket + HTTP)
// Endpoints:
//   WS   /ws/intake/:sessionId        → real-time chat session
//   POST /api/clinical-chat           → send message (SSE streaming)
//   POST /api/clinical-result         → generate clinical result
// Delegates to chat-agents for AI inference.
// ═══════════════════════════════════════════════════════════════════

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
// §4 — trya-backend: Journey Service
// Backend: handslab-trya-backend
// Endpoints:
//   GET /api/citizens/:citizenId/journeys   → list journeys
//   GET /api/journeys/:journeyId            → single journey
//   GET /api/intakes/:intakeId              → intake details
// ═══════════════════════════════════════════════════════════════════

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
// §5 — trya-backend: Clinical Review Service
// Backend: handslab-trya-backend
// Endpoints:
//   GET  /api/professional/clinical-packages
//   GET  /api/professional/clinical-packages/:id
//   POST /api/professional/validate
// ═══════════════════════════════════════════════════════════════════

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
// §6 — chat-agents: Clinical Summary Service
// Backend: handslab-trya-chat-agents (via chat-backend proxy)
// The chat-agents system generates structured clinical output:
//   - ClinicalSummary (narrative + findings)
//   - CID-10 code suggestions
//   - Risk classification
// This is invoked indirectly via chat-backend's /api/clinical-result.
// Direct endpoint (internal): POST /api/agents/summarize
// ═══════════════════════════════════════════════════════════════════

export interface IClinicalSummaryService {
  /** Generate a clinical summary from intake messages */
  generateSummary(
    intakeId: string,
    messages: TriageMessage[],
  ): Promise<ClinicalSummary>;

  /** Re-generate summary with additional context */
  regenerateSummary(
    intakeId: string,
    messages: TriageMessage[],
    additionalContext?: string,
  ): Promise<ClinicalSummary>;
}

// ═══════════════════════════════════════════════════════════════════
// §7 — chat-agents: Referral Service
// Backend: handslab-trya-chat-agents (via chat-backend proxy)
// Generates referral recommendations using AI reasoning.
// Internal endpoint: POST /api/agents/referral-decision
// ═══════════════════════════════════════════════════════════════════

export interface IReferralService {
  /** Generate a referral recommendation from clinical data */
  generateRecommendation(
    intakeId: string,
    summary: ClinicalSummary,
    exams: ExamSuggestion[],
  ): Promise<ReferralRecommendation>;

  /** Recalculate recommendation after exam results */
  recalculateAfterExams(
    intakeId: string,
    summary: ClinicalSummary,
    completedExams: ExamSuggestion[],
  ): Promise<ReferralRecommendation>;
}

// ═══════════════════════════════════════════════════════════════════
// §8 — trya-backend + chat-agents: Exam Service
// Backend: handslab-trya-backend (CRUD) + chat-agents (suggestions)
// Endpoints:
//   GET    /api/exams?intakeId=X           → list exams for intake
//   PATCH  /api/exams/:examId/status       → update exam status
//   POST   /api/agents/suggest-exams       → AI-suggested exams (via chat-agents)
// ═══════════════════════════════════════════════════════════════════

export interface IExamService {
  /** List exams for a given intake */
  getExamsForIntake(intakeId: string): Promise<ExamSuggestion[]>;

  /** Update exam status (e.g. REQUESTED → COMPLETED) */
  updateExamStatus(
    examId: string,
    status: ExamSuggestion['status'],
    result?: string,
  ): Promise<ExamSuggestion>;

  /** AI-suggest exams based on clinical data (delegates to chat-agents) */
  suggestExams(
    intakeId: string,
    summary: ClinicalSummary,
  ): Promise<ExamSuggestion[]>;
}

// ═══════════════════════════════════════════════════════════════════
// §9 — platform-backend: Dashboard Service
// Backend: handslab-trya-platform-backend (NOT used in MVP1)
// Endpoints:
//   GET /api/manager/dashboard
//   GET /api/manager/dashboard/kpis
//   GET /api/manager/dashboard/bottlenecks
//   GET /api/manager/dashboard/weekly-trend
// ═══════════════════════════════════════════════════════════════════

export interface IDashboardService {
  fetchDashboard(filters?: DashboardFilters): Promise<DashboardResponse>;
  fetchKPIs(filters?: DashboardFilters): Promise<KPIsResponse>;
  fetchBottlenecks(filters?: DashboardFilters): Promise<BottleneckDTO[]>;
  fetchWeeklyTrend(filters?: DashboardFilters, weeks?: number): Promise<WeeklyTrendDTO[]>;
}

// ═══════════════════════════════════════════════════════════════════
// §10 — Auth Service (already implemented in auth-service.ts)
// ═══════════════════════════════════════════════════════════════════

export type { IAuthService, AppSession, AppUser } from '@/services/auth-service';
