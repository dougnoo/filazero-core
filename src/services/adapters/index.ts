/**
 * Service Adapters — Public API.
 *
 * Exports:
 *   - Interfaces (ICaseService, IIntakeService, etc.)
 *   - Factory functions (createCaseService, etc.)
 *
 * Usage:
 *   import { createCaseService, type ICaseService } from '@/services/adapters';
 *   const caseService = createCaseService();
 */

export type {
  ICaseService,
  IIntakeService,
  IJourneyService,
  IClinicalReviewService,
  IDashboardService,
  IAuthService,
  AppSession,
  AppUser,
} from './types';

export {
  createCaseService,
  createIntakeService,
  createJourneyService,
  createClinicalReviewService,
  createDashboardService,
} from './factory';
