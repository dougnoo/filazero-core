/**
 * Clinical Review Service — Abstraction for professional clinical package review.
 * 
 * Mock mode: returns local data.
 * Real mode: calls trya-backend REST API.
 */

import type { CareJourney } from '@/domain/types/care-journey';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import { mockCareJourneys, mockClinicalIntake } from '@/lib/mock-clinical-data';
import { CareJourneyStatus } from '@/domain/enums/care-journey-status';
import { isMockMode } from '@/lib/env';
import { tryaApi } from '@/lib/api-client';

export interface ClinicalPackage {
  journey: CareJourney;
  intake: ClinicalIntake;
}

/**
 * Fetches clinical packages pending professional review.
 * In production: GET /api/professional/clinical-packages?status=pending
 */
export async function getPendingClinicalPackages(): Promise<ClinicalPackage[]> {
  if (!isMockMode()) {
    const { data } = await tryaApi.get<ClinicalPackage[]>('/professional/clinical-packages?status=pending');
    return data;
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
    intake: { ...mockClinicalIntake, id: journey.intakeId, citizenId: journey.citizenId },
  }));
}

/**
 * Fetches all clinical packages (including resolved) for history.
 */
export async function getAllClinicalPackages(): Promise<ClinicalPackage[]> {
  await new Promise((r) => setTimeout(r, 400));
  return mockCareJourneys.map((journey) => ({
    journey,
    intake: { ...mockClinicalIntake, id: journey.intakeId, citizenId: journey.citizenId },
  }));
}

// ─── Validation Actions (stubs for future backend integration) ───

export type ValidationAction =
  | 'APPROVE_EXAMS'
  | 'REJECT_EXAMS'
  | 'APPROVE_REFERRAL'
  | 'REJECT_REFERRAL'
  | 'REQUEST_MORE_INFO'
  | 'RESOLVE_PRIMARY';

export interface ValidationPayload {
  journeyId: string;
  action: ValidationAction;
  notes?: string;
  modifiedExamIds?: string[];
}

/**
 * Submits a medical validation action.
 * In production: POST /api/professional/validate
 */
export async function submitValidation(payload: ValidationPayload): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 600));
  console.log('[clinical-review-service] Validation submitted:', payload);
  return { success: true };
}
