/**
 * Service Factory — Selects mock or API implementation per service.
 *
 * Decision tree:
 *   if DEMO_MODE → always mock (zero network calls)
 *   else if granular flag (e.g. ENABLE_REAL_TRYA) + URL configured → API impl
 *   else → mock
 *
 * Usage (future — not wired yet):
 *   const caseService = createCaseService();
 *   const cases = await caseService.getCases();
 *
 * Current state:
 *   All create* functions return mock implementations that delegate to
 *   the existing service functions in src/services/*.ts.
 *   API implementations are stubbed with clear TODO markers.
 *
 * ─── Integration Checklist ─────────────────────────────────────────
 *
 * To activate a real service:
 *   1. Set VITE_DEMO_MODE=false
 *   2. Set the granular flag (e.g. VITE_ENABLE_REAL_TRYA=true)
 *   3. Set the backend URL (e.g. VITE_TRYA_BACKEND_URL=https://api.filazero.com/v1)
 *   4. Implement the Api* class methods using tryaApi / platformApi from api-client.ts
 *   5. Test with a single service first (mixed mode is supported)
 */

import {
  isTryaMockMode,
  isChatMockMode,
  isPlatformMockMode,
} from '@/lib/env';

import type {
  ICaseService,
  IIntakeService,
  IJourneyService,
  IClinicalReviewService,
  IDashboardService,
} from './types';

// ─── Lazy imports for mock implementations ──────────────────────
// These wrap the existing service functions as adapter implementations.

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

// ═══════════════════════════════════════════════════════════════════
// §1 — Mock Adapters (delegate to existing service functions)
// ═══════════════════════════════════════════════════════════════════

class MockCaseService implements ICaseService {
  getCases = getCases;
  getCaseById = getCaseById;
  getCaseCountsByStatus = getCaseCountsByStatus;
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

class MockDashboardService implements IDashboardService {
  fetchDashboard = fetchDashboardData;
  fetchKPIs = fetchKPIs;
  fetchBottlenecks = fetchBottlenecks;
  fetchWeeklyTrend = fetchWeeklyTrend;
}

// ═══════════════════════════════════════════════════════════════════
// §2 — API Adapters (stubs — implement when backend is ready)
// ═══════════════════════════════════════════════════════════════════

// TODO: Implement ApiCaseService using tryaApi.get('/api/cases', ...)
// TODO: Implement ApiIntakeService using chat-backend SSE + HTTP
// TODO: Implement ApiJourneyService using tryaApi.get('/api/journeys', ...)
// TODO: Implement ApiClinicalReviewService using tryaApi
// TODO: Implement ApiDashboardService using platformApi

// ═══════════════════════════════════════════════════════════════════
// §3 — Factory Functions
// ═══════════════════════════════════════════════════════════════════

/**
 * Creates a CaseService adapter.
 * Backend: trya-backend
 * Flag: ENABLE_REAL_TRYA + TRYA_BACKEND_URL
 */
export function createCaseService(): ICaseService {
  if (!isTryaMockMode()) {
    // TODO: return new ApiCaseService();
    console.warn('[factory] ApiCaseService not implemented — falling back to mock');
  }
  return new MockCaseService();
}

/**
 * Creates an IntakeService adapter.
 * Backend: chat-backend (SSE streaming)
 * Flag: ENABLE_REAL_CHAT + CHAT_HTTP_URL
 */
export function createIntakeService(): IIntakeService {
  if (!isChatMockMode()) {
    // TODO: return new ApiIntakeService();
    console.warn('[factory] ApiIntakeService not implemented — falling back to mock');
  }
  return new MockIntakeService();
}

/**
 * Creates a JourneyService adapter.
 * Backend: trya-backend
 * Flag: ENABLE_REAL_TRYA + TRYA_BACKEND_URL
 */
export function createJourneyService(): IJourneyService {
  if (!isTryaMockMode()) {
    // TODO: return new ApiJourneyService();
    console.warn('[factory] ApiJourneyService not implemented — falling back to mock');
  }
  return new MockJourneyService();
}

/**
 * Creates a ClinicalReviewService adapter.
 * Backend: trya-backend
 * Flag: ENABLE_REAL_TRYA + TRYA_BACKEND_URL
 */
export function createClinicalReviewService(): IClinicalReviewService {
  if (!isTryaMockMode()) {
    // TODO: return new ApiClinicalReviewService();
    console.warn('[factory] ApiClinicalReviewService not implemented — falling back to mock');
  }
  return new MockClinicalReviewService();
}

/**
 * Creates a DashboardService adapter.
 * Backend: platform-backend
 * Flag: ENABLE_REAL_PLATFORM + PLATFORM_BACKEND_URL
 */
export function createDashboardService(): IDashboardService {
  if (!isPlatformMockMode()) {
    // TODO: return new ApiDashboardService();
    console.warn('[factory] ApiDashboardService not implemented — falling back to mock');
  }
  return new MockDashboardService();
}
