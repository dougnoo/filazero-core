/**
 * API Stub Providers — Barrel export.
 *
 * All classes are stubs that throw on invocation.
 * They exist to:
 *   1. Validate interface compliance at compile time
 *   2. Provide clear error messages if accidentally activated
 *   3. Document the expected API endpoints and payloads
 */

// trya-backend (handslab-trya-backend)
export {
  ApiCaseService,
  ApiPatientService,
  ApiJourneyService,
  ApiClinicalReviewService,
  ApiExamService,
} from './trya-backend.stub';

// chat-backend (handslab-trya-chat-backend)
export { ApiIntakeService } from './chat-backend.stub';

// chat-agents (handslab-trya-chat-agents)
export {
  ApiClinicalSummaryService,
  ApiReferralService,
} from './chat-agents.stub';

// platform-backend (handslab-trya-platform-backend)
export { ApiDashboardService } from './platform-backend.stub';
