/**
 * ApiPatientService — Real implementation for trya-backend.
 *
 * Connects to:
 *   GET /api/patients/:id            → patient details
 *   GET /api/patients/search?cpf=X   → lookup by CPF
 *   GET /api/patients/:id/history    → clinical history
 *
 * Base URL: env.TRYA_BACKEND_URL
 * Auth: Bearer JWT + X-Municipality-Id + X-Unit-Id (via api-client.ts)
 *
 * ─── Error Resilience ──────────────────────────────────────────────
 * This class does NOT handle fallback — that responsibility belongs
 * to the ResilientPatientService wrapper in the factory.
 */

import { tryaApi } from '@/lib/api-client';
import type { Patient } from '@/domain/types/case';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { IPatientService } from '@/services/adapters/types';

// ═══════════════════════════════════════════════════════════════════
// §1 — Backend DTO types
// ═══════════════════════════════════════════════════════════════════

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
  cns?: string;
  email?: string;
  address?: Record<string, unknown>;
  medications?: string[];
  allergies?: string[];
  is_pregnant?: boolean;
  isPregnant?: boolean;
  has_disability?: boolean;
  hasDisability?: boolean;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

interface BackendClinicalHistoryDTO {
  id: string;
  chief_complaint?: string;
  chiefComplaint?: string;
  clinical_summary?: Record<string, unknown>;
  clinicalSummary?: Record<string, unknown>;
  risk_level?: string;
  riskLevel?: string;
  created_at?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface BackendHistoryResponse {
  data?: BackendClinicalHistoryDTO[];
  items?: BackendClinicalHistoryDTO[];
}

// ═══════════════════════════════════════════════════════════════════
// §2 — DTO → Frontend Model Mappers
// ═══════════════════════════════════════════════════════════════════

function mapPatient(dto: BackendPatientDTO): Patient {
  return {
    id: dto.id,
    fullName: dto.full_name ?? dto.fullName ?? 'Paciente',
    cpf: dto.cpf,
    birthDate: dto.birth_date ?? dto.birthDate,
    gender: (['M', 'F', 'OTHER'].includes(dto.gender ?? '')
      ? dto.gender
      : undefined) as Patient['gender'],
    phone: dto.phone,
    chronicConditions: dto.chronic_conditions ?? dto.chronicConditions,
  };
}

/**
 * Maps backend clinical history DTOs to ClinicalIntake.
 * This is a best-effort mapper — the real shape will be refined
 * once the actual API contract is finalized.
 */
function mapClinicalHistory(dto: BackendClinicalHistoryDTO): ClinicalIntake {
  return {
    id: dto.id,
    chiefComplaint: dto.chief_complaint ?? dto.chiefComplaint ?? '',
    createdAt: dto.created_at ?? dto.createdAt ?? new Date().toISOString(),
  } as unknown as ClinicalIntake;
}

// ═══════════════════════════════════════════════════════════════════
// §3 — ApiPatientService Implementation
// ═══════════════════════════════════════════════════════════════════

export class ApiPatientService implements IPatientService {
  /**
   * GET /api/patients/:id
   */
  async getPatientById(patientId: string): Promise<Patient | null> {
    try {
      const { data } = await tryaApi.get<BackendPatientDTO>(
        `/api/patients/${patientId}`,
      );
      return mapPatient(data);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'statusCode' in err &&
        (err as { statusCode: number }).statusCode === 404
      ) {
        return null;
      }
      throw err;
    }
  }

  /**
   * GET /api/patients/search?cpf=123.456.789-00
   */
  async searchPatientByCPF(cpf: string): Promise<Patient | null> {
    try {
      const { data } = await tryaApi.get<BackendPatientDTO>(
        `/api/patients/search?cpf=${encodeURIComponent(cpf)}`,
      );
      return mapPatient(data);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'statusCode' in err &&
        (err as { statusCode: number }).statusCode === 404
      ) {
        return null;
      }
      throw err;
    }
  }

  /**
   * GET /api/patients/:id/history
   */
  async getPatientClinicalHistory(
    patientId: string,
  ): Promise<ClinicalIntake[]> {
    const { data } = await tryaApi.get<
      BackendHistoryResponse | BackendClinicalHistoryDTO[]
    >(`/api/patients/${patientId}/history`);

    const items = Array.isArray(data)
      ? data
      : (data.data ?? data.items ?? []);

    return items.map(mapClinicalHistory);
  }
}
