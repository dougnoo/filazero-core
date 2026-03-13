/**
 * Service Registry — Singleton instances created by factories.
 *
 * Components import from here instead of calling raw service functions.
 * The factory picks mock vs API based on env flags at startup.
 *
 * Usage:
 *   import { services } from '@/services/adapters';
 *   const cases = await services.cases.getCases();
 */

import {
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

export const services = {
  cases: createCaseService(),
  patients: createPatientService(),
  intake: createIntakeService(),
  journeys: createJourneyService(),
  clinicalReview: createClinicalReviewService(),
  clinicalSummary: createClinicalSummaryService(),
  referral: createReferralService(),
  exams: createExamService(),
  dashboard: createDashboardService(),
} as const;
