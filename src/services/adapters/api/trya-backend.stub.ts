/**
 * API Stubs — trya-backend (handslab-trya-backend)
 *
 * Remaining stubs for services not yet promoted to real implementations.
 * Currently they throw clear errors if accidentally activated.
 *
 * Target base URL: env.TRYA_BACKEND_URL
 * Auth: Bearer JWT + X-Municipality-Id + X-Unit-Id (via api-client.ts)
 *
 * Promoted to real:
 *   - CaseService → case-service.api.ts
 *   - PatientService → patient-service.api.ts
 *   - JourneyService → journey-service.api.ts
 *   - ClinicalReviewService → clinical-review-service.api.ts
 */

import type { ExamSuggestion } from '@/domain/types/clinical-intake';
import type { IExamService } from '@/services/adapters/types';

const NOT_IMPL = (method: string) =>
  new Error(`[ApiStub] ${method} not implemented — connect trya-backend first`);

// ─── Exam Service ───────────────────────────────────────────────

export class ApiExamService implements IExamService {
  /**
   * GET /api/exams?intakeId=X
   */
  async getExamsForIntake(_intakeId: string): Promise<ExamSuggestion[]> {
    throw NOT_IMPL('ApiExamService.getExamsForIntake');
  }

  /**
   * PATCH /api/exams/:examId/status
   */
  async updateExamStatus(
    _examId: string,
    _status: ExamSuggestion['status'],
    _result?: string,
  ): Promise<ExamSuggestion> {
    throw NOT_IMPL('ApiExamService.updateExamStatus');
  }

  /**
   * Delegates to chat-agents: POST /api/agents/suggest-exams
   * Called via chat-backend proxy.
   */
  async suggestExams(
    _intakeId: string,
    _summary: import('@/domain/types/clinical-intake').ClinicalSummary,
  ): Promise<ExamSuggestion[]> {
    throw NOT_IMPL('ApiExamService.suggestExams');
  }
}
