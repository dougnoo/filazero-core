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
 */

import type { ExamSuggestion } from '@/domain/types/clinical-intake';
import type {
  ValidationRequest,
  ValidationResponse,
  ClinicalPackageListParams,
} from '@/domain/contracts/trya-backend';
import type { ClinicalPackage } from '@/services/clinical-review-service';
import type {
  IClinicalReviewService,
  IExamService,
} from '@/services/adapters/types';

const NOT_IMPL = (method: string) =>
  new Error(`[ApiStub] ${method} not implemented — connect trya-backend first`);

// ─── Clinical Review Service ────────────────────────────────────

export class ApiClinicalReviewService implements IClinicalReviewService {
  /**
   * GET /api/professional/clinical-packages?status=pending
   */
  async getPendingPackages(
    _params?: Omit<ClinicalPackageListParams, 'status'>,
  ): Promise<ClinicalPackage[]> {
    throw NOT_IMPL('ApiClinicalReviewService.getPendingPackages');
    // TODO:
    // const query = new URLSearchParams({ status: 'pending' });
    // const { data } = await tryaApi.get<{ data: ClinicalPackage[] }>(
    //   `/api/professional/clinical-packages?${query}`,
    // );
    // return data.data;
  }

  async getAllPackages(_params?: ClinicalPackageListParams): Promise<ClinicalPackage[]> {
    throw NOT_IMPL('ApiClinicalReviewService.getAllPackages');
  }

  async getPackageById(_journeyId: string): Promise<ClinicalPackage | null> {
    throw NOT_IMPL('ApiClinicalReviewService.getPackageById');
  }

  /**
   * POST /api/professional/validate
   */
  async submitValidation(_payload: ValidationRequest): Promise<ValidationResponse> {
    throw NOT_IMPL('ApiClinicalReviewService.submitValidation');
    // TODO:
    // const { data } = await tryaApi.post<ValidationResponse>('/api/professional/validate', payload);
    // return data;
  }
}

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
