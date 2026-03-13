/**
 * Service Factory — Selects mock or API implementation per service.
 *
 * Decision tree:
 *   if DEMO_MODE → always mock (zero network calls)
 *   else if granular flag + URL configured → API impl (with resilient fallback)
 *   else → mock
 *
 * Phase 7: CaseService is the first real integration.
 *   Uses ResilientCaseService for automatic fallback to mock on API failure.
 *
 * ─── Backend Module Mapping ────────────────────────────────────────
 *
 * trya-backend:     CaseService ✅ (real), PatientService, JourneyService,
 *                   ClinicalReviewService, ExamService
 * chat-backend:     IntakeService
 * chat-agents:      ClinicalSummaryService, ReferralService
 * platform-backend: DashboardService
 */

import {
  isTryaMockMode,
  isChatMockMode,
  isPlatformMockMode,
} from '@/lib/env';

import type {
  ICaseService,
  IPatientService,
  IIntakeService,
  IJourneyService,
  IClinicalReviewService,
  IClinicalSummaryService,
  IReferralService,
  IExamService,
  IDashboardService,
} from './types';

// ─── Mock service imports (existing service functions) ───────────

import {
  getCases,
  getCaseById,
  getCaseCountsByStatus,
} from '@/services/case-service';

import {
  sendIntakeMessage,
  generateIntakeResult,
  getGreetingMessage,
} from '@/services/intake-service';

import {
  getCitizenJourneys,
  getJourneyById,
  getIntakeForJourney,
  getCitizenJourneyHistory,
} from '@/services/journey-service';

import {
  getPendingClinicalPackages,
  getAllClinicalPackages,
  getClinicalPackageById,
  submitValidation,
} from '@/services/clinical-review-service';

import {
  fetchDashboardData,
  fetchKPIs,
  fetchBottlenecks,
  fetchWeeklyTrend,
} from '@/services/dashboard-service';

import { mockClinicalIntake } from '@/mock';

// ─── API imports ────────────────────────────────────────────────

import {
  ApiCaseService,
  ApiPatientService,
  ApiJourneyService,
  ApiClinicalReviewService,
  ApiExamService,
  ApiIntakeService,
  ApiClinicalSummaryService,
  ApiReferralService,
  ApiDashboardService,
} from './api';

import { ResilientCaseService } from './resilient-case-service';
import { ResilientPatientService } from './resilient-patient-service';
import { ResilientIntakeService } from './resilient-intake-service';
import { ResilientJourneyService } from './resilient-journey-service';
import { ResilientClinicalReviewService } from './resilient-clinical-review-service';

// ═══════════════════════════════════════════════════════════════════
// §1 — Mock Adapters (delegate to existing service functions)
// ═══════════════════════════════════════════════════════════════════

class MockCaseService implements ICaseService {
  getCases = getCases;
  getCaseById = getCaseById;
  getCaseCountsByStatus = getCaseCountsByStatus;
}

class MockPatientService implements IPatientService {
  async getPatientById(patientId: string) {
    // Patient is embedded in Case — extract from mock cases
    const caseItem = await getCaseById(patientId);
    return caseItem?.patient ?? null;
  }
  async searchPatientByCPF(cpf: string) {
    const cases = await getCases();
    const found = cases.find((c) => c.patient.cpf === cpf);
    return found?.patient ?? null;
  }
  async getPatientClinicalHistory(_patientId: string) {
    await new Promise((r) => setTimeout(r, 300));
    return [mockClinicalIntake];
  }
}

class MockIntakeService implements IIntakeService {
  sendMessage = sendIntakeMessage;
  generateResult = generateIntakeResult;
  getGreetingMessage = getGreetingMessage;
}

class MockJourneyService implements IJourneyService {
  getCitizenJourneys = getCitizenJourneys;
  getJourneyById = getJourneyById;
  getIntakeForJourney = getIntakeForJourney;
  getCitizenJourneyHistory = getCitizenJourneyHistory;
}

class MockClinicalReviewService implements IClinicalReviewService {
  getPendingPackages = getPendingClinicalPackages;
  getAllPackages = getAllClinicalPackages;
  getPackageById = getClinicalPackageById;
  submitValidation = submitValidation;
}

class MockClinicalSummaryService implements IClinicalSummaryService {
  async generateSummary(_intakeId: string, _messages: import('@/domain/types/triage').TriageMessage[]) {
    await new Promise((r) => setTimeout(r, 500));
    return mockClinicalIntake.clinicalSummary!;
  }
  async regenerateSummary(intakeId: string, messages: import('@/domain/types/triage').TriageMessage[]) {
    return this.generateSummary(intakeId, messages);
  }
}

class MockReferralService implements IReferralService {
  async generateRecommendation() {
    await new Promise((r) => setTimeout(r, 500));
    return mockClinicalIntake.referralRecommendation!;
  }
  async recalculateAfterExams() {
    return this.generateRecommendation();
  }
}

class MockExamService implements IExamService {
  async getExamsForIntake(_intakeId: string) {
    await new Promise((r) => setTimeout(r, 300));
    return mockClinicalIntake.examSuggestions ?? [];
  }
  async updateExamStatus(examId: string, status: import('@/domain/types/clinical-intake').ExamSuggestion['status'], result?: string) {
    await new Promise((r) => setTimeout(r, 200));
    const exam = mockClinicalIntake.examSuggestions?.find((e) => e.id === examId);
    if (!exam) throw new Error(`Exam ${examId} not found`);
    return { ...exam, status, result, completedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined };
  }
  async suggestExams() {
    await new Promise((r) => setTimeout(r, 500));
    return mockClinicalIntake.examSuggestions ?? [];
  }
}

class MockDashboardService implements IDashboardService {
  fetchDashboard = fetchDashboardData;
  fetchKPIs = fetchKPIs;
  fetchBottlenecks = fetchBottlenecks;
  fetchWeeklyTrend = fetchWeeklyTrend;
}

// ═══════════════════════════════════════════════════════════════════
// §2 — Factory Functions
// ═══════════════════════════════════════════════════════════════════

/**
 * trya-backend → Case CRUD
 *
 * Phase 7: First real integration.
 * When DEMO_MODE=false + ENABLE_REAL_TRYA=true + TRYA_BACKEND_URL set:
 *   → Uses ApiCaseService wrapped in ResilientCaseService
 *   → If API fails, automatically falls back to mock (circuit breaker)
 */
export function createCaseService(): ICaseService {
  if (!isTryaMockMode()) {
    console.info('[factory] ✅ CaseService → API (with resilient fallback)');
    const api = new ApiCaseService();
    const mock = new MockCaseService();
    return new ResilientCaseService(api, mock);
  }
  return new MockCaseService();
}

/** trya-backend → Patient lookup */
export function createPatientService(): IPatientService {
  if (!isTryaMockMode()) {
    console.info('[factory] ✅ PatientService → API (with resilient fallback)');
    const api = new ApiPatientService();
    const mock = new MockPatientService();
    return new ResilientPatientService(api, mock);
  }
  return new MockPatientService();
}

/**
 * Intake Service — Uses Supabase Edge Functions (clinical-chat / clinical-result).
 *
 * The edge functions are always available (deployed on Lovable Cloud),
 * so we use ApiIntakeService by default with mock as fallback.
 * Only pure DEMO_MODE with no Supabase URL skips the API.
 */
export function createIntakeService(): IIntakeService {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';

  if (supabaseUrl) {
    console.info('[factory] ✅ IntakeService → API (Supabase Edge Functions, with resilient mock fallback)');
    const api = new ApiIntakeService();
    const mock = new MockIntakeService();
    return new ResilientIntakeService(api, mock);
  }

  console.info('[factory] IntakeService → Mock (no Supabase URL)');
  return new MockIntakeService();
}

/** trya-backend → Journey tracking */
export function createJourneyService(): IJourneyService {
  if (!isTryaMockMode()) {
    console.info('[factory] ✅ JourneyService → API (with resilient fallback)');
    const api = new ApiJourneyService();
    const mock = new MockJourneyService();
    return new ResilientJourneyService(api, mock);
  }
  return new MockJourneyService();
}

/** trya-backend → Clinical review & validation */
export function createClinicalReviewService(): IClinicalReviewService {
  if (!isTryaMockMode()) {
    console.warn('[factory] ApiClinicalReviewService is a stub — falling back to mock');
  }
  return new MockClinicalReviewService();
}

/** chat-agents → AI clinical summary generation */
export function createClinicalSummaryService(): IClinicalSummaryService {
  if (!isChatMockMode()) {
    console.warn('[factory] ApiClinicalSummaryService is a stub — falling back to mock');
  }
  return new MockClinicalSummaryService();
}

/** chat-agents → AI referral recommendation */
export function createReferralService(): IReferralService {
  if (!isChatMockMode()) {
    console.warn('[factory] ApiReferralService is a stub — falling back to mock');
  }
  return new MockReferralService();
}

/** trya-backend + chat-agents → Exam management */
export function createExamService(): IExamService {
  if (!isTryaMockMode()) {
    console.warn('[factory] ApiExamService is a stub — falling back to mock');
  }
  return new MockExamService();
}

/** platform-backend → Manager dashboard analytics */
export function createDashboardService(): IDashboardService {
  if (!isPlatformMockMode()) {
    console.warn('[factory] ApiDashboardService is a stub — falling back to mock');
  }
  return new MockDashboardService();
}
