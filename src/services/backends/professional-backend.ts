/**
 * Professional Backend — All services consumed by the Médico (doctor) channel.
 *
 * Aggregates: clinical review, validation actions, queue management.
 * In DEMO_MODE: 100% mock, zero network calls.
 */

// ─── Clinical Review (package review & validation) ──────────────
export {
  getPendingClinicalPackages,
  getAllClinicalPackages,
  getClinicalPackageById,
  submitValidation,
  type ClinicalPackage,
  type ValidationAction,
  type ValidationPayload,
} from '@/services/clinical-review-service';

// ─── Journey context (read-only, for case detail) ───────────────
export {
  getJourneyById,
  getIntakeForJourney,
} from '@/services/journey-service';

// ─── Auth (staff email/password login) ──────────────────────────
export { authService } from '@/services/auth-service';
