/**
 * UBS Backend — Services for the Health Unit (Unidade Básica de Saúde) context.
 *
 * Now delegates to the service adapter layer (factory picks mock vs real API).
 * Shared across Professional and Manager views at the unit level.
 * In DEMO_MODE: 100% mock, zero network calls.
 */

import { services } from '@/services/adapters';

// ─── Queue & Journey Orchestration ──────────────────────────────
export const getCitizenJourneys = services.journeys.getCitizenJourneys.bind(services.journeys);
export const getJourneyById = services.journeys.getJourneyById.bind(services.journeys);
export const getIntakeForJourney = services.journeys.getIntakeForJourney.bind(services.journeys);
export const getCitizenJourneyHistory = services.journeys.getCitizenJourneyHistory.bind(services.journeys);

// ─── Clinical Packages (unit-level view) ────────────────────────
export const getPendingClinicalPackages = services.clinicalReview.getPendingPackages.bind(services.clinicalReview);
export const getAllClinicalPackages = services.clinicalReview.getAllPackages.bind(services.clinicalReview);
export const getClinicalPackageById = services.clinicalReview.getPackageById.bind(services.clinicalReview);

// ─── Unit-level mock data ───────────────────────────────────────
export {
  mockCareJourneys,
  mockClinicalDashboardStats,
} from '@/mock';

// ─── Auth ───────────────────────────────────────────────────────
export { authService } from '@/services/auth-service';
