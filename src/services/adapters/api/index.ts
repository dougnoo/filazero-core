/**
 * API Providers — Barrel export.
 *
 * ApiCaseService: REAL implementation (Phase 7)
 * ApiPatientService: REAL implementation (Phase 7)
 * All others: stubs that throw on invocation (future phases)
 */

// trya-backend — REAL (Phase 7)
export { ApiCaseService } from './case-service.api';
export { ApiPatientService } from './patient-service.api';

// trya-backend — stubs (future)
export {
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
