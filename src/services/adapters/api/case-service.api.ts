/**
 * ApiCaseService — Real implementation for trya-backend.
 *
 * Connects to:
 *   GET /api/cases              → list with filters
 *   GET /api/cases/:id          → single case
 *   GET /api/cases/counts       → counts by status
 *
 * Base URL: env.TRYA_BACKEND_URL
 * Auth: Bearer JWT + X-Municipality-Id + X-Unit-Id (via api-client.ts)
 *
 * ─── DTO Mapping ───────────────────────────────────────────────────
 * The backend may return a slightly different shape (snake_case, nested
 * differently). The mappers below normalize backend DTOs into the
 * frontend Case model. Adjust mappers as the real API contract solidifies.
 *
 * ─── Error Resilience ──────────────────────────────────────────────
 * This class does NOT handle fallback — that responsibility belongs
 * to the ResilientCaseService wrapper in the factory.
 */

import { tryaApi } from '@/lib/api-client';
import type { Case, Patient } from '@/domain/types/case';
import { CaseStatus } from '@/domain/enums/case-status';
import { RiskLevel } from '@/domain/enums/risk-level';
import type { CaseFilters } from '@/services/case-service';
import type { ICaseService } from '../types';

// ═══════════════════════════════════════════════════════════════════
// §1 — Backend DTO types (what trya-backend actually returns)
// These will be refined as the real API contract is documented.
// ═══════════════════════════════════════════════════════════════════

/** Raw patient shape from trya-backend */
interface BackendPatientDTO {
  id: string;
  full_name?: string;
  fullName?: string;
  cpf?: string;
  birth_date?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  chronic_conditions?: string[];
  chronicConditions?: string[];
}

/** Raw case shape from trya-backend */
interface BackendCaseDTO {
  id: string;
  patient?: BackendPatientDTO;
  // Some endpoints may embed patient fields at root level
  patient_id?: string;
  patient_name?: string;

  status?: string;
  risk_level?: string;
  riskLevel?: string;
  priority_score?: number;
  priorityScore?: number;

  chief_complaint?: string;
  chiefComplaint?: string;
  suggested_destination?: string;
  suggestedDestination?: string;

  assigned_unit_id?: string;
  assignedUnitId?: string;
  assigned_unit_name?: string;
  assignedUnitName?: string;

  reviewed_by?: string;
  reviewedBy?: string;
  review_status?: string;
  reviewStatus?: string;
  referral_decision?: string;
  referralDecision?: string;
  ai_confidence?: number;
  aiConfidence?: number;

  intake_id?: string;
  intakeId?: string;
  journey_id?: string;
  journeyId?: string;

  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  resolved_at?: string;
  resolvedAt?: string;
}

/** Paginated list response from trya-backend */
interface BackendCaseListResponse {
  data?: BackendCaseDTO[];
  items?: BackendCaseDTO[];
  // Some APIs return flat arrays
  total?: number;
  page?: number;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════════════
// §2 — DTO → Frontend Model Mappers
// ═══════════════════════════════════════════════════════════════════

/** Safely map a string to CaseStatus, defaulting to STARTED */
function mapCaseStatus(raw?: string): CaseStatus {
  if (!raw) return CaseStatus.STARTED;
  const upper = raw.toUpperCase().replace(/-/g, '_');
  if (Object.values(CaseStatus).includes(upper as CaseStatus)) {
    return upper as CaseStatus;
  }
  // Common backend aliases
  const aliases: Record<string, CaseStatus> = {
    PENDING: CaseStatus.AWAITING_REVIEW,
    ACTIVE: CaseStatus.IN_TRIAGE,
    CLOSED: CaseStatus.COMPLETED,
    RESOLVED: CaseStatus.COMPLETED,
    TRIAGED: CaseStatus.AWAITING_REVIEW,
  };
  return aliases[upper] ?? CaseStatus.STARTED;
}

/** Safely map a string to RiskLevel, defaulting to LESS_URGENT */
function mapRiskLevel(raw?: string): RiskLevel {
  if (!raw) return RiskLevel.LESS_URGENT;
  const upper = raw.toUpperCase().replace(/-/g, '_');
  if (Object.values(RiskLevel).includes(upper as RiskLevel)) {
    return upper as RiskLevel;
  }
  // Manchester color aliases
  const aliases: Record<string, RiskLevel> = {
    RED: RiskLevel.EMERGENCY,
    ORANGE: RiskLevel.VERY_URGENT,
    YELLOW: RiskLevel.URGENT,
    GREEN: RiskLevel.LESS_URGENT,
    BLUE: RiskLevel.NON_URGENT,
    VERMELHO: RiskLevel.EMERGENCY,
    LARANJA: RiskLevel.VERY_URGENT,
    AMARELO: RiskLevel.URGENT,
    VERDE: RiskLevel.LESS_URGENT,
    AZUL: RiskLevel.NON_URGENT,
  };
  return aliases[upper] ?? RiskLevel.LESS_URGENT;
}

function mapPatient(dto?: BackendPatientDTO, fallback?: { id?: string; name?: string }): Patient {
  if (!dto) {
    return {
      id: fallback?.id ?? 'unknown',
      fullName: fallback?.name ?? 'Paciente Desconhecido',
    };
  }
  return {
    id: dto.id,
    fullName: dto.full_name ?? dto.fullName ?? 'Paciente',
    cpf: dto.cpf,
    birthDate: dto.birth_date ?? dto.birthDate,
    gender: (['M', 'F', 'OTHER'].includes(dto.gender ?? '') ? dto.gender : undefined) as Patient['gender'],
    phone: dto.phone,
    chronicConditions: dto.chronic_conditions ?? dto.chronicConditions,
  };
}

function mapCase(dto: BackendCaseDTO): Case {
  return {
    id: dto.id,
    patient: mapPatient(dto.patient, {
      id: dto.patient_id,
      name: dto.patient_name,
    }),
    status: mapCaseStatus(dto.status),
    riskLevel: mapRiskLevel(dto.risk_level ?? dto.riskLevel),
    priorityScore: dto.priority_score ?? dto.priorityScore ?? 50,
    chiefComplaint: dto.chief_complaint ?? dto.chiefComplaint ?? '',
    suggestedDestination: dto.suggested_destination ?? dto.suggestedDestination,
    assignedUnitId: dto.assigned_unit_id ?? dto.assignedUnitId ?? '',
    assignedUnitName: dto.assigned_unit_name ?? dto.assignedUnitName ?? 'UBS',
    reviewedBy: dto.reviewed_by ?? dto.reviewedBy,
    reviewStatus: (['pending', 'in_progress', 'completed'].includes(dto.review_status ?? dto.reviewStatus ?? '')
      ? (dto.review_status ?? dto.reviewStatus) as Case['reviewStatus']
      : 'pending'),
    referralDecision: dto.referral_decision ?? dto.referralDecision
      ? (dto.referral_decision ?? dto.referralDecision) as Case['referralDecision']
      : undefined,
    aiConfidence: dto.ai_confidence ?? dto.aiConfidence,
    intakeId: dto.intake_id ?? dto.intakeId ?? '',
    journeyId: dto.journey_id ?? dto.journeyId ?? '',
    createdAt: dto.created_at ?? dto.createdAt ?? new Date().toISOString(),
    updatedAt: dto.updated_at ?? dto.updatedAt ?? new Date().toISOString(),
    resolvedAt: dto.resolved_at ?? dto.resolvedAt,
  };
}

// ═══════════════════════════════════════════════════════════════════
// §3 — ApiCaseService Implementation
// ═══════════════════════════════════════════════════════════════════

export class ApiCaseService implements ICaseService {
  /**
   * GET /api/cases?status=X&riskLevel=Y&search=Z&unitId=W&reviewStatus=V
   */
  async getCases(filters?: CaseFilters): Promise<Case[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.riskLevel) params.set('riskLevel', filters.riskLevel);
    if (filters?.reviewStatus) params.set('reviewStatus', filters.reviewStatus);
    if (filters?.unitId) params.set('unitId', filters.unitId);
    if (filters?.search) params.set('search', filters.search);

    const qs = params.toString();
    const path = `/api/cases${qs ? `?${qs}` : ''}`;

    const { data } = await tryaApi.get<BackendCaseListResponse | BackendCaseDTO[]>(path);

    // Handle both paginated { data: [...] } and flat array responses
    const items = Array.isArray(data)
      ? data
      : (data.data ?? data.items ?? []);

    return items.map(mapCase);
  }

  /**
   * GET /api/cases/:id
   */
  async getCaseById(caseId: string): Promise<Case | null> {
    try {
      const { data } = await tryaApi.get<BackendCaseDTO>(`/api/cases/${caseId}`);
      return mapCase(data);
    } catch (err: unknown) {
      // 404 is a valid "not found" — return null
      if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  /**
   * GET /api/cases/counts
   *
   * Backend may return:
   *   { STARTED: 5, IN_TRIAGE: 3, ... }          → direct enum keys
   *   { started: 5, in_triage: 3, ... }           → lowercase
   *   [{ status: "STARTED", count: 5 }, ...]      → array format
   */
  async getCaseCountsByStatus(): Promise<Record<CaseStatus, number>> {
    const { data } = await tryaApi.get<
      Record<string, number> | Array<{ status: string; count: number }>
    >('/api/cases/counts');

    // Initialize all statuses to 0
    const counts = Object.fromEntries(
      Object.values(CaseStatus).map((s) => [s, 0]),
    ) as Record<CaseStatus, number>;

    if (Array.isArray(data)) {
      // Array format: [{ status: "STARTED", count: 5 }]
      data.forEach((item) => {
        const mapped = mapCaseStatus(item.status);
        counts[mapped] = (counts[mapped] ?? 0) + item.count;
      });
    } else {
      // Object format: { STARTED: 5, in_triage: 3 }
      Object.entries(data).forEach(([key, value]) => {
        const mapped = mapCaseStatus(key);
        counts[mapped] = (counts[mapped] ?? 0) + value;
      });
    }

    return counts;
  }
}
