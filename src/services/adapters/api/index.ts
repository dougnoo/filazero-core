/**
 * API Providers — Barrel export.
 *
 * ApiCaseService: REAL implementation (Phase 7)
 * ApiPatientService: REAL implementation (Phase 7)
 * ApiIntakeService: REAL implementation (Phase 7)
 * All others: stubs that throw on invocation (future phases)
 */

// trya-backend — REAL (Phase 7)
export { ApiCaseService } from './case-service.api';
export { ApiPatientService } from './patient-service.api';

// chat-backend — REAL (Phase 7)
export { ApiIntakeService } from './intake-service.api';

// trya-backend — REAL (Phase 8)
export { ApiClinicalReviewService } from './clinical-review-service.api';

// trya-backend — stubs (future)
export { ApiExamService } from './trya-backend.stub';

// trya-backend — REAL (Phase 7)
export { ApiJourneyService } from './journey-service.api';

// chat-agents (handslab-trya-chat-agents)
export {
  ApiClinicalSummaryService,
  ApiReferralService,
} from './chat-agents.stub';

// platform-backend (handslab-trya-platform-backend)
export { ApiDashboardService } from './platform-backend.stub';
