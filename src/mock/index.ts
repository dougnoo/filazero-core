/**
 * Mock Data — Consolidated exports for DEMO_MODE.
 *
 * All mock data used across the platform lives here.
 * When DEMO_MODE=true, services import from this module only.
 */

// Clinical: intakes, journeys, dashboard stats
export {
  mockClinicalIntake,
  mockClinicalSummary,
  mockExamSuggestions,
  mockReferralRecommendation,
  mockIntakesMap,
  mockCareJourneys,
  mockClinicalDashboardStats,
} from './clinical-data';

// Queue: positions, triage, legacy dashboard
export {
  mockQueuePositions,
  mockTriageSummary,
  mockDashboardStats,
} from './queue-data';
