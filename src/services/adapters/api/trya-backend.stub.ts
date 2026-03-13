/**
 * API Stubs — trya-backend (handslab-trya-backend)
 *
 * These classes will be implemented when the real backend is connected.
 * Currently they throw clear errors if accidentally activated.
 *
 * Target base URL: env.TRYA_BACKEND_URL
 * Auth: Bearer JWT + X-Municipality-Id + X-Unit-Id (via api-client.ts)
 */

import { tryaApi } from '@/lib/api-client';
import type { Case, Patient } from '@/domain/types/case';
import type { CareJourney } from '@/domain/types/care-journey';
import type { ClinicalIntake, ExamSuggestion } from '@/domain/types/clinical-intake';
import type {
  ValidationRequest,
  ValidationResponse,
  ClinicalPackageListParams,
  JourneyListParams,
} from '@/domain/contracts/trya-backend';
import type { CaseStatus } from '@/domain/enums/case-status';
import type { CaseFilters } from '@/services/case-service';
import type { ClinicalPackage } from '@/services/clinical-review-service';
import type {
  ICaseService,
  IPatientService,
  IJourneyService,
  IClinicalReviewService,
  IExamService,
} from '../types';

const NOT_IMPL = (method: string) =>
  new Error(`[ApiStub] ${method} not implemented — connect trya-backend first`);

// ─── Case Service ───────────────────────────────────────────────

export class ApiCaseService implements ICaseService {
  /**
   * GET /api/cases?status=X&riskLevel=Y&search=Z
   */
  async getCases(_filters?: CaseFilters): Promise<Case[]> {
    throw NOT_IMPL('ApiCaseService.getCases');
    // TODO:
    // const params = new URLSearchParams();
    // if (filters?.status) params.set('status', filters.status);
    // if (filters?.riskLevel) params.set('riskLevel', filters.riskLevel);
    // if (filters?.search) params.set('search', filters.search);
    // const { data } = await tryaApi.get<Case[]>(`/api/cases?${params}`);
    // return data;
  }

  /**
   * GET /api/cases/:id
   */
  async getCaseById(_caseId: string): Promise<Case | null> {
    throw NOT_IMPL('ApiCaseService.getCaseById');
    // TODO:
    // const { data } = await tryaApi.get<Case>(`/api/cases/${caseId}`);
    // return data;
  }

  /**
   * GET /api/cases/counts
   */
  async getCaseCountsByStatus(): Promise<Record<CaseStatus, number>> {
    throw NOT_IMPL('ApiCaseService.getCaseCountsByStatus');
    // TODO:
    // const { data } = await tryaApi.get<Record<CaseStatus, number>>('/api/cases/counts');
    // return data;
  }
}

// ─── Patient Service ────────────────────────────────────────────

export class ApiPatientService implements IPatientService {
  /**
   * GET /api/patients/:id
   */
  async getPatientById(_patientId: string): Promise<Patient | null> {
    throw NOT_IMPL('ApiPatientService.getPatientById');
    // TODO:
    // const { data } = await tryaApi.get<Patient>(`/api/patients/${patientId}`);
    // return data;
  }

  /**
   * GET /api/patients/search?cpf=123.456.789-00
   */
  async searchPatientByCPF(_cpf: string): Promise<Patient | null> {
    throw NOT_IMPL('ApiPatientService.searchPatientByCPF');
    // TODO:
    // const { data } = await tryaApi.get<Patient>(`/api/patients/search?cpf=${cpf}`);
    // return data;
  }

  /**
   * GET /api/patients/:id/history
   */
  async getPatientClinicalHistory(_patientId: string): Promise<ClinicalIntake[]> {
    throw NOT_IMPL('ApiPatientService.getPatientClinicalHistory');
    // TODO:
    // const { data } = await tryaApi.get<ClinicalIntake[]>(`/api/patients/${patientId}/history`);
    // return data;
  }
}

// ─── Journey Service ────────────────────────────────────────────

export class ApiJourneyService implements IJourneyService {
  /**
   * GET /api/citizens/:citizenId/journeys?status=active
   */
  async getCitizenJourneys(_citizenId: string, _params?: JourneyListParams): Promise<CareJourney[]> {
    throw NOT_IMPL('ApiJourneyService.getCitizenJourneys');
    // TODO:
    // const query = new URLSearchParams({ status: params?.status ?? 'active' });
    // const { data } = await tryaApi.get<CareJourney[]>(`/api/citizens/${citizenId}/journeys?${query}`);
    // return data;
  }

  async getJourneyById(_journeyId: string): Promise<CareJourney | null> {
    throw NOT_IMPL('ApiJourneyService.getJourneyById');
  }

  async getIntakeForJourney(_intakeId: string): Promise<ClinicalIntake | null> {
    throw NOT_IMPL('ApiJourneyService.getIntakeForJourney');
  }

  async getCitizenJourneyHistory(_citizenId: string): Promise<CareJourney[]> {
    throw NOT_IMPL('ApiJourneyService.getCitizenJourneyHistory');
  }
}

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
