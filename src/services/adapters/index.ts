/**
 * Service Adapters — Public API.
 *
 * Exports:
 *   - Interfaces (ICaseService, IPatientService, etc.)
 *   - Factory functions (createCaseService, etc.)
 *
 * Usage:
 *   import { createCaseService, type ICaseService } from '@/services/adapters';
 *   const caseService = createCaseService();
 *
 * Backend module mapping:
 *   trya-backend:     Case, Patient, Journey, ClinicalReview, Exam
 *   chat-backend:     Intake
 *   chat-agents:      ClinicalSummary, Referral
 *   platform-backend: Dashboard
 */

export type {
  ICaseService,
  IPatientService,
  IIntakeService,
  IJourneyService,
  IClinicalReviewService,
  IClinicalSummaryService,
  IReferralService,
  IExamService,
  IDashboardService,
  IAuthService,
  AppSession,
  AppUser,
} from './types';

export {
  createCaseService,
  createPatientService,
  createIntakeService,
  createJourneyService,
  createClinicalReviewService,
  createClinicalSummaryService,
  createReferralService,
  createExamService,
  createDashboardService,
} from './factory';

export { services } from './service-registry';
