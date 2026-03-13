/**
 * ApiJourneyService — Real implementation for trya-backend.
 *
 * Connects to:
 *   GET /api/citizens/:citizenId/journeys   → list journeys (with status filter)
 *   GET /api/journeys/:journeyId            → single journey detail
 *   GET /api/intakes/:intakeId              → clinical intake for journey
 *
 * Base URL: env.TRYA_BACKEND_URL
 * Auth: Bearer JWT + X-Municipality-Id + X-Unit-Id (via api-client.ts)
 *
 * ─── DTO Mapping ───────────────────────────────────────────────────
 * The backend may return snake_case or slightly different nesting.
 * Mappers normalize to the frontend CareJourney/ClinicalIntake models.
 *
 * ─── Error Resilience ──────────────────────────────────────────────
 * This class does NOT handle fallback — that responsibility belongs
 * to the ResilientJourneyService wrapper in the factory.
 */

import { tryaApi } from '@/lib/api-client';
import type { CareJourney, CareStep } from '@/domain/types/care-journey';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { JourneyListParams } from '@/domain/contracts/trya-backend';
import { CareJourneyStatus } from '@/domain/enums/care-journey-status';
import { CareStepStatus } from '@/domain/enums/care-step-status';
import { RiskLevel } from '@/domain/enums/risk-level';
import type { IJourneyService } from '@/services/adapters/types';

// ═══════════════════════════════════════════════════════════════════
// §1 — Backend DTO types
// ═══════════════════════════════════════════════════════════════════

interface BackendCareStepDTO {
  id: string;
  journey_id?: string;
  journeyId?: string;
  order?: number;
  type?: string;
  label?: string;
  description?: string;
  status?: string;
  assigned_unit_id?: string;
  assignedUnitId?: string;
  assigned_professional_id?: string;
  assignedProfessionalId?: string;
  started_at?: string;
  startedAt?: string;
  completed_at?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

interface BackendJourneyDTO {
  id: string;
  citizen_id?: string;
  citizenId?: string;
  citizen_name?: string;
  citizenName?: string;
  intake_id?: string;
  intakeId?: string;
  origin_unit_id?: string;
  originUnitId?: string;

  chief_complaint?: string;
  chiefComplaint?: string;
  risk_level?: string;
  riskLevel?: string;
  priority_score?: number;
  priorityScore?: number;
  referral_urgency?: string;
  referralUrgency?: string;
  target_specialty?: string;
  targetSpecialty?: string;

  status?: string;
  steps?: BackendCareStepDTO[];
  current_step_index?: number;
  currentStepIndex?: number;

  queue_position_id?: string;
  queuePositionId?: string;
  estimated_wait_days?: number;
  estimatedWaitDays?: number;

  started_at?: string;
  startedAt?: string;
  resolved_at?: string;
  resolvedAt?: string;
  resolution?: string;
}

interface BackendJourneyListResponse {
  data?: BackendJourneyDTO[];
  items?: BackendJourneyDTO[];
}

// ═══════════════════════════════════════════════════════════════════
// §2 — DTO → Frontend Model Mappers
// ═══════════════════════════════════════════════════════════════════

const RISK_MAP: Record<string, RiskLevel> = {
  EMERGENCY: RiskLevel.EMERGENCY,
  VERY_URGENT: RiskLevel.VERY_URGENT,
  URGENT: RiskLevel.URGENT,
  LESS_URGENT: RiskLevel.LESS_URGENT,
  NON_URGENT: RiskLevel.NON_URGENT,
  VERMELHO: RiskLevel.EMERGENCY,
  LARANJA: RiskLevel.VERY_URGENT,
  AMARELO: RiskLevel.URGENT,
  VERDE: RiskLevel.LESS_URGENT,
  AZUL: RiskLevel.NON_URGENT,
};

function mapRiskLevel(raw?: string): RiskLevel {
  if (!raw) return RiskLevel.LESS_URGENT;
  return RISK_MAP[raw.toUpperCase()] ?? RiskLevel.LESS_URGENT;
}

function mapJourneyStatus(raw?: string): CareJourneyStatus {
  if (!raw) return CareJourneyStatus.INTAKE_STARTED;
  const upper = raw.toUpperCase().replace(/-/g, '_');
  if (Object.values(CareJourneyStatus).includes(upper as CareJourneyStatus)) {
    return upper as CareJourneyStatus;
  }
  return CareJourneyStatus.INTAKE_STARTED;
}

function mapStepStatus(raw?: string): CareStepStatus {
  if (!raw) return CareStepStatus.PENDING;
  const upper = raw.toUpperCase().replace(/-/g, '_');
  if (Object.values(CareStepStatus).includes(upper as CareStepStatus)) {
    return upper as CareStepStatus;
  }
  return CareStepStatus.PENDING;
}

function mapStep(dto: BackendCareStepDTO): CareStep {
  return {
    id: dto.id,
    journeyId: dto.journey_id ?? dto.journeyId ?? '',
    order: dto.order ?? 0,
    type: (dto.type ?? 'INTAKE') as CareStep['type'],
    label: dto.label ?? '',
    description: dto.description,
    status: mapStepStatus(dto.status),
    assignedUnitId: dto.assigned_unit_id ?? dto.assignedUnitId,
    assignedProfessionalId: dto.assigned_professional_id ?? dto.assignedProfessionalId,
    startedAt: dto.started_at ?? dto.startedAt,
    completedAt: dto.completed_at ?? dto.completedAt,
    metadata: dto.metadata,
  };
}

function mapJourney(dto: BackendJourneyDTO): CareJourney {
  return {
    id: dto.id,
    citizenId: dto.citizen_id ?? dto.citizenId ?? '',
    citizenName: dto.citizen_name ?? dto.citizenName ?? 'Paciente',
    intakeId: dto.intake_id ?? dto.intakeId ?? '',
    originUnitId: dto.origin_unit_id ?? dto.originUnitId ?? '',
    chiefComplaint: dto.chief_complaint ?? dto.chiefComplaint ?? '',
    riskLevel: mapRiskLevel(dto.risk_level ?? dto.riskLevel),
    priorityScore: dto.priority_score ?? dto.priorityScore ?? 50,
    referralUrgency: dto.referral_urgency ?? dto.referralUrgency
      ? (dto.referral_urgency ?? dto.referralUrgency) as CareJourney['referralUrgency']
      : undefined,
    targetSpecialty: dto.target_specialty ?? dto.targetSpecialty,
    status: mapJourneyStatus(dto.status),
    steps: (dto.steps ?? []).map(mapStep),
    currentStepIndex: dto.current_step_index ?? dto.currentStepIndex ?? 0,
    queuePositionId: dto.queue_position_id ?? dto.queuePositionId,
    estimatedWaitDays: dto.estimated_wait_days ?? dto.estimatedWaitDays,
    startedAt: dto.started_at ?? dto.startedAt ?? new Date().toISOString(),
    resolvedAt: dto.resolved_at ?? dto.resolvedAt,
    resolution: dto.resolution as CareJourney['resolution'],
  };
}

// ═══════════════════════════════════════════════════════════════════
// §3 — ApiJourneyService Implementation
// ═══════════════════════════════════════════════════════════════════

export class ApiJourneyService implements IJourneyService {
  /**
   * GET /api/citizens/:citizenId/journeys?status=active
   */
  async getCitizenJourneys(
    citizenId: string,
    params?: JourneyListParams,
  ): Promise<CareJourney[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);

    const qs = query.toString();
    const path = `/api/citizens/${citizenId}/journeys${qs ? `?${qs}` : ''}`;
    const { data } = await tryaApi.get<BackendJourneyListResponse | BackendJourneyDTO[]>(path);

    const items = Array.isArray(data) ? data : (data.data ?? data.items ?? []);
    return items.map(mapJourney);
  }

  /**
   * GET /api/journeys/:journeyId
   */
  async getJourneyById(journeyId: string): Promise<CareJourney | null> {
    try {
      const { data } = await tryaApi.get<BackendJourneyDTO>(`/api/journeys/${journeyId}`);
      return mapJourney(data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  /**
   * GET /api/intakes/:intakeId
   */
  async getIntakeForJourney(intakeId: string): Promise<ClinicalIntake | null> {
    try {
      const { data } = await tryaApi.get<ClinicalIntake>(`/api/intakes/${intakeId}`);
      return data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  /**
   * GET /api/citizens/:citizenId/journeys (all statuses)
   */
  async getCitizenJourneyHistory(citizenId: string): Promise<CareJourney[]> {
    const { data } = await tryaApi.get<BackendJourneyListResponse | BackendJourneyDTO[]>(
      `/api/citizens/${citizenId}/journeys`,
    );
    const items = Array.isArray(data) ? data : (data.data ?? data.items ?? []);
    return items.map(mapJourney);
  }
}
