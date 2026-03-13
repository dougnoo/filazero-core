/**
 * Clinical Review Service — Professional clinical package review & validation.
 *
 * Backend: trya-backend
 * Contract: src/domain/contracts/trya-backend.ts
 *
 * Mock mode: returns local data.
 * Real mode: calls trya-backend REST API.
 */

import type { CareJourney } from '@/domain/types/care-journey';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type {
  ValidationRequest,
  ValidationResponse,
  ValidationActionType,
  ClinicalPackageListParams,
} from '@/domain/contracts/trya-backend';
import { mockCareJourneys, mockIntakesMap, mockClinicalIntake } from '@/lib/mock-clinical-data';
import { CareJourneyStatus } from '@/domain/enums/care-journey-status';
import { isTryaMockMode } from '@/lib/env';
import { tryaApi } from '@/lib/api-client';

// ─── Public types (re-exported for UI consumption) ──────────────

export interface ClinicalPackage {
  journey: CareJourney;
  intake: ClinicalIntake;
}

/** @deprecated Use ValidationActionType from contracts */
export type ValidationAction = ValidationActionType;

export interface ValidationPayload extends ValidationRequest {}

// ─── Service functions ──────────────────────────────────────────

/**
 * Fetches clinical packages pending professional review.
 * Backend: GET /api/professional/clinical-packages?status=pending
 */
export async function getPendingClinicalPackages(
  params?: Omit<ClinicalPackageListParams, 'status'>,
): Promise<ClinicalPackage[]> {
  if (!isTryaMockMode()) {
    const query = new URLSearchParams({ status: 'pending' });
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.order) query.set('order', params.order);

    const { data } = await tryaApi.get<{ data: ClinicalPackage[] }>(
      `/professional/clinical-packages?${query}`,
    );
    return data.data;
  }

  await new Promise((r) => setTimeout(r, 400));
  const reviewableStatuses = new Set([
    CareJourneyStatus.TRIAGE_COMPLETE,
    CareJourneyStatus.EXAMS_PENDING,
    CareJourneyStatus.EXAMS_COMPLETE,
    CareJourneyStatus.REFERRAL_PENDING,
  ]);

  const pendingJourneys = mockCareJourneys.filter((j) => reviewableStatuses.has(j.status));

  return pendingJourneys.map((journey) => ({
    journey,
    intake: mockIntakesMap[journey.intakeId] ?? { ...mockClinicalIntake, id: journey.intakeId, citizenId: journey.citizenId },
  }));
}

/**
 * Fetches all clinical packages (including resolved) for history.
 * Backend: GET /api/professional/clinical-packages
 */
export async function getAllClinicalPackages(
  params?: ClinicalPackageListParams,
): Promise<ClinicalPackage[]> {
  if (!isTryaMockMode()) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const { data } = await tryaApi.get<{ data: ClinicalPackage[] }>(
      `/professional/clinical-packages?${query}`,
    );
    return data.data;
  }

  await new Promise((r) => setTimeout(r, 400));
  return mockCareJourneys.map((journey) => ({
    journey,
    intake: mockIntakesMap[journey.intakeId] ?? { ...mockClinicalIntake, id: journey.intakeId, citizenId: journey.citizenId },
  }));
}

/**
 * Fetches a single clinical package by journey ID.
 * Backend: GET /api/professional/clinical-packages/:id
 */
export async function getClinicalPackageById(journeyId: string): Promise<ClinicalPackage | null> {
  if (!isTryaMockMode()) {
    const { data } = await tryaApi.get<ClinicalPackage>(
      `/professional/clinical-packages/${journeyId}`,
    );
    return data;
  }

  await new Promise((r) => setTimeout(r, 300));
  const journey = mockCareJourneys.find((j) => j.id === journeyId);
  if (!journey) return null;
  return {
    journey,
    intake: mockIntakesMap[journey.intakeId] ?? { ...mockClinicalIntake, id: journey.intakeId, citizenId: journey.citizenId },
  };
}

/**
 * Submits a medical validation action.
 * Backend: POST /api/professional/validate
 *
 * Returns the new journey status and updated steps.
 */
export async function submitValidation(payload: ValidationPayload): Promise<ValidationResponse> {
  if (!isTryaMockMode()) {
    const { data } = await tryaApi.post<ValidationResponse>('/professional/validate', payload);
    return data;
  }

  await new Promise((r) => setTimeout(r, 600));
  console.log('[clinical-review-service] Validation submitted:', payload);

  // Mock: simulate state transition
  const journey = mockCareJourneys.find((j) => j.id === payload.journeyId);
  const currentStatus = journey?.status ?? CareJourneyStatus.TRIAGE_COMPLETE;

  let newStatus = currentStatus;
  switch (payload.action) {
    case 'APPROVE_EXAMS':
      newStatus = CareJourneyStatus.EXAMS_PENDING;
      break;
    case 'APPROVE_REFERRAL':
      newStatus = CareJourneyStatus.REFERRAL_SCHEDULED;
      break;
    case 'RESOLVE_PRIMARY':
      newStatus = CareJourneyStatus.RESOLVED;
      break;
  }

  return {
    success: true,
    journeyId: payload.journeyId,
    newStatus,
    message: 'Validação registrada com sucesso.',
  };
}
