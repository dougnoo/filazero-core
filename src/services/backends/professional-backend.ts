/**
 * Professional Backend — All services consumed by the Médico (doctor) channel.
 *
 * Now delegates to the service adapter layer (factory picks mock vs real API).
 * In DEMO_MODE: 100% mock, zero network calls.
 */

import { services } from '@/services/adapters';

// ─── Clinical Review (package review & validation) ──────────────
export const getPendingClinicalPackages = services.clinicalReview.getPendingPackages.bind(services.clinicalReview);
export const getAllClinicalPackages = services.clinicalReview.getAllPackages.bind(services.clinicalReview);
export const getClinicalPackageById = services.clinicalReview.getPackageById.bind(services.clinicalReview);
export const submitValidation = services.clinicalReview.submitValidation.bind(services.clinicalReview);
export type { ClinicalPackage, ValidationAction, ValidationPayload } from '@/services/clinical-review-service';

// ─── Journey context (read-only, for case detail) ───────────────
export const getJourneyById = services.journeys.getJourneyById.bind(services.journeys);
export const getIntakeForJourney = services.journeys.getIntakeForJourney.bind(services.journeys);

// ─── Auth (staff email/password login) ──────────────────────────
export { authService } from '@/services/auth-service';
