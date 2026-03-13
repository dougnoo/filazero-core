/**
 * UBS Backend — Services for the Health Unit (Unidade Básica de Saúde) context.
 *
 * Aggregates: unit-level queue, journey orchestration, intake results.
 * Shared across Professional and Manager views at the unit level.
 * In DEMO_MODE: 100% mock, zero network calls.
 */

// ─── Queue & Journey Orchestration ──────────────────────────────
export {
  getCitizenJourneys,
  getJourneyById,
  getIntakeForJourney,
  getCitizenJourneyHistory,
} from '@/services/journey-service';

// ─── Clinical Packages (unit-level view) ────────────────────────
export {
  getPendingClinicalPackages,
  getAllClinicalPackages,
  getClinicalPackageById,
} from '@/services/clinical-review-service';

// ─── Unit-level mock data ───────────────────────────────────────
export {
  mockCareJourneys,
  mockClinicalDashboardStats,
} from '@/mock';

// ─── Auth ───────────────────────────────────────────────────────
export { authService } from '@/services/auth-service';
