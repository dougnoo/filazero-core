/**
 * ApiClinicalReviewService — Real implementation for trya-backend.
 *
 * Connects to:
 *   GET  /api/professional/clinical-packages         → list with filters
 *   GET  /api/professional/clinical-packages/:id     → single package
 *   POST /api/professional/validate                  → submit validation (read-only phase: stubbed)
 *
 * Base URL: env.TRYA_BACKEND_URL
 * Auth: Bearer JWT + X-Municipality-Id + X-Unit-Id (via api-client.ts)
 *
 * ─── DTO Mapping ───────────────────────────────────────────────────
 * Maps backend ClinicalPackageDTO → frontend ClinicalPackage model.
 * Handles both camelCase and snake_case field names.
 *
 * ─── Phase 8: Read-only ────────────────────────────────────────────
 * submitValidation is NOT real yet — will throw until write is stable.
 */

import { tryaApi } from '@/lib/api-client';
import type {
  ClinicalPackageListParams,
  ClinicalPackageDTO,
  ClinicalPackageListResponse,
  ValidationRequest,
  ValidationResponse,
  JourneyDTO,
  ClinicalIntakeDTO,
  CareStepDTO,
} from '@/domain/contracts/trya-backend';
import type { ClinicalPackage } from '@/services/clinical-review-service';
import type { IClinicalReviewService } from '@/services/adapters/types';
import type { CareJourney, CareStep } from '@/domain/types/care-journey';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import { RiskLevel } from '@/domain/enums/risk-level';
import { CareJourneyStatus } from '@/domain/enums/care-journey-status';
import { CareStepStatus } from '@/domain/enums/care-step-status';

const isDev = import.meta.env.DEV;

function debugLog(label: string, ...args: unknown[]) {
  if (!isDev) return;
  console.log(`[ApiClinicalReviewService][${label}]`, ...args);
}

// ═══════════════════════════════════════════════════════════════════
// §1 — DTO Mappers
// ═══════════════════════════════════════════════════════════════════

const RISK_MAP: Record<string, RiskLevel> = {
  EMERGENCY: RiskLevel.EMERGENCY,
  VERY_URGENT: RiskLevel.VERY_URGENT,
  URGENT: RiskLevel.URGENT,
  LESS_URGENT: RiskLevel.LESS_URGENT,
  NON_URGENT: RiskLevel.NON_URGENT,
};

function mapRisk(raw: string | undefined): RiskLevel {
  return RISK_MAP[(raw ?? '').toUpperCase()] ?? RiskLevel.LESS_URGENT;
}

function mapStatus(raw: string | undefined): CareJourneyStatus {
  const val = (raw ?? 'INTAKE') as CareJourneyStatus;
  return Object.values(CareJourneyStatus).includes(val) ? val : CareJourneyStatus.INTAKE;
}

function mapStepStatus(raw: string | undefined): CareStepStatus {
  const val = (raw ?? 'PENDING') as CareStepStatus;
  return Object.values(CareStepStatus).includes(val) ? val : CareStepStatus.PENDING;
}

function mapStep(dto: CareStepDTO): CareStep {
  const d = dto as unknown as Record<string, unknown>;
  return {
    id: dto.id,
    journeyId: dto.journeyId ?? (d.journey_id as string) ?? '',
    order: dto.order,
    type: dto.type,
    label: dto.label,
    description: dto.description,
    status: mapStepStatus(dto.status),
    assignedUnitId: dto.assignedUnitId ?? (d.assigned_unit_id as string),
    assignedProfessionalId: dto.assignedProfessionalId ?? (d.assigned_professional_id as string),
    startedAt: dto.startedAt ?? (d.started_at as string),
    completedAt: dto.completedAt ?? (d.completed_at as string),
    metadata: dto.metadata,
  };
}

function mapJourney(dto: JourneyDTO): CareJourney {
  const d = dto as unknown as Record<string, unknown>;
  return {
    id: dto.id,
    citizenId: dto.citizenId ?? (d.citizen_id as string) ?? '',
    citizenName: dto.citizenName ?? (d.citizen_name as string) ?? '',
    intakeId: dto.intakeId ?? (d.intake_id as string) ?? '',
    originUnitId: dto.originUnitId ?? (d.origin_unit_id as string) ?? '',
    chiefComplaint: dto.chiefComplaint ?? (d.chief_complaint as string) ?? '',
    riskLevel: mapRisk(dto.riskLevel ?? (d.risk_level as string)),
    priorityScore: dto.priorityScore ?? (d.priority_score as number) ?? 50,
    referralUrgency: dto.referralUrgency ?? (d.referral_urgency as string) as CareJourney['referralUrgency'],
    targetSpecialty: dto.targetSpecialty ?? (d.target_specialty as string),
    status: mapStatus(dto.status),
    steps: (dto.steps ?? []).map(mapStep),
    currentStepIndex: dto.currentStepIndex ?? (d.current_step_index as number) ?? 0,
    queuePositionId: dto.queuePositionId ?? (d.queue_position_id as string),
    estimatedWaitDays: dto.estimatedWaitDays ?? (d.estimated_wait_days as number),
    startedAt: dto.startedAt ?? (d.started_at as string) ?? new Date().toISOString(),
    resolvedAt: dto.resolvedAt ?? (d.resolved_at as string),
    resolution: dto.resolution,
  };
}

function mapIntake(dto: ClinicalIntakeDTO): ClinicalIntake {
  const d = dto as unknown as Record<string, unknown>;
  return {
    id: dto.id,
    citizenId: dto.citizenId ?? (d.citizen_id as string) ?? '',
    unitId: dto.unitId ?? (d.unit_id as string) ?? '',
    messages: [],
    chiefComplaint: dto.chiefComplaint ?? (d.chief_complaint as string) ?? '',
    symptoms: dto.symptoms ?? [],
    symptomDuration: dto.symptomDuration ?? (d.symptom_duration as string),
    painScale: dto.painScale ?? (d.pain_scale as number),
    currentMedications: dto.currentMedications ?? (d.current_medications as string[]) ?? [],
    allergies: dto.allergies ?? [],
    chronicConditions: dto.chronicConditions ?? (d.chronic_conditions as string[]) ?? [],
    familyHistory: dto.familyHistory ?? (d.family_history as string[]) ?? [],
    riskLevel: mapRisk(dto.riskLevel ?? (d.risk_level as string)),
    priorityScore: dto.priorityScore ?? (d.priority_score as number) ?? 50,
    clinicalSummary: dto.clinicalSummary
      ? {
          id: dto.clinicalSummary.id,
          intakeId: dto.clinicalSummary.intakeId ?? (dto.clinicalSummary as unknown as Record<string, unknown>).intake_id as string ?? dto.id,
          narrative: dto.clinicalSummary.narrative ?? '',
          structuredFindings: dto.clinicalSummary.structuredFindings ?? [],
          suspectedConditions: dto.clinicalSummary.suspectedConditions ?? [],
          relevantHistory: dto.clinicalSummary.relevantHistory ?? '',
          riskFactors: dto.clinicalSummary.riskFactors ?? [],
          generatedAt: dto.clinicalSummary.generatedAt ?? new Date().toISOString(),
        }
      : undefined,
    examSuggestions: (dto.examSuggestions ?? []).map((e) => ({
      id: e.id,
      intakeId: e.intakeId ?? (e as unknown as Record<string, unknown>).intake_id as string ?? dto.id,
      examName: e.examName ?? (e as unknown as Record<string, unknown>).exam_name as string ?? '',
      examCode: e.examCode ?? (e as unknown as Record<string, unknown>).exam_code as string,
      category: e.category ?? 'OTHER',
      priority: e.priority ?? 'ROUTINE',
      justification: e.justification ?? '',
      status: e.status ?? 'SUGGESTED',
      result: e.result,
      completedAt: e.completedAt ?? (e as unknown as Record<string, unknown>).completed_at as string,
    })),
    referralRecommendation: dto.referralRecommendation
      ? {
          id: dto.referralRecommendation.id,
          intakeId: dto.referralRecommendation.intakeId ?? dto.id,
          decision: dto.referralRecommendation.decision ?? 'NEEDS_MORE_DATA',
          confidence: dto.referralRecommendation.confidence ?? 50,
          specialty: dto.referralRecommendation.specialty,
          justification: dto.referralRecommendation.justification ?? '',
          requiredExamsBeforeReferral: dto.referralRecommendation.requiredExamsBeforeReferral ?? [],
          alternativeActions: dto.referralRecommendation.alternativeActions ?? [],
          generatedAt: dto.referralRecommendation.generatedAt ?? new Date().toISOString(),
        }
      : undefined,
    isComplete: dto.isComplete ?? (d.is_complete as boolean) ?? true,
    startedAt: dto.startedAt ?? (d.started_at as string) ?? new Date().toISOString(),
    completedAt: dto.completedAt ?? (d.completed_at as string),
  };
}

function mapPackage(dto: ClinicalPackageDTO): ClinicalPackage {
  return {
    journey: mapJourney(dto.journey),
    intake: mapIntake(dto.intake),
  };
}

// ═══════════════════════════════════════════════════════════════════
// §2 — ApiClinicalReviewService
// ═══════════════════════════════════════════════════════════════════

export class ApiClinicalReviewService implements IClinicalReviewService {
  /**
   * GET /api/professional/clinical-packages?status=pending
   */
  async getPendingPackages(
    params?: Omit<ClinicalPackageListParams, 'status'>,
  ): Promise<ClinicalPackage[]> {
    const query = new URLSearchParams({ status: 'pending' });
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.order) query.set('order', params.order);

    debugLog('GET_PENDING', { url: `/api/professional/clinical-packages?${query}` });

    const { data } = await tryaApi.get<ClinicalPackageListResponse>(
      `/api/professional/clinical-packages?${query}`,
    );

    debugLog('GET_PENDING_RESPONSE', { total: data.total, count: data.data.length });
    return data.data.map(mapPackage);
  }

  /**
   * GET /api/professional/clinical-packages
   */
  async getAllPackages(params?: ClinicalPackageListParams): Promise<ClinicalPackage[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.order) query.set('order', params.order);

    debugLog('GET_ALL', { url: `/api/professional/clinical-packages?${query}` });

    const { data } = await tryaApi.get<ClinicalPackageListResponse>(
      `/api/professional/clinical-packages?${query}`,
    );

    debugLog('GET_ALL_RESPONSE', { total: data.total, count: data.data.length });
    return data.data.map(mapPackage);
  }

  /**
   * GET /api/professional/clinical-packages/:id
   */
  async getPackageById(journeyId: string): Promise<ClinicalPackage | null> {
    debugLog('GET_BY_ID', { journeyId });

    const { data } = await tryaApi.get<ClinicalPackageDTO>(
      `/api/professional/clinical-packages/${journeyId}`,
    );

    debugLog('GET_BY_ID_RESPONSE', { journeyId, hasData: !!data });
    return data ? mapPackage(data) : null;
  }

  /**
   * POST /api/professional/validate
   *
   * Phase 8: Write is NOT enabled yet. Will throw intentionally.
   * Enable after read operations are confirmed stable.
   */
  async submitValidation(payload: ValidationRequest): Promise<ValidationResponse> {
    debugLog('SUBMIT_VALIDATION', { payload });

    const { data } = await tryaApi.post<ValidationResponse>(
      '/api/professional/validate',
      payload,
    );

    debugLog('SUBMIT_VALIDATION_RESPONSE', data);
    return data;
  }
}
