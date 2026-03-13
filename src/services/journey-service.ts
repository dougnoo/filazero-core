/**
 * Journey Service — Citizen care journey data.
 *
 * Backend: trya-backend
 * Contract: src/domain/contracts/trya-backend.ts
 *
 * Mock mode: returns local data.
 * Real mode: calls trya-backend REST API.
 */

import type { CareJourney } from '@/domain/types/care-journey';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { JourneyListParams } from '@/domain/contracts/trya-backend';
import { mockCareJourneys, mockClinicalIntake } from '@/lib/mock-clinical-data';
import { isTryaMockMode } from '@/lib/env';
import { tryaApi } from '@/lib/api-client';

/**
 * Fetches active care journeys for the current citizen.
 * Backend: GET /api/citizens/:citizenId/journeys?status=active
 */
export async function getCitizenJourneys(
  citizenId: string,
  params?: JourneyListParams,
): Promise<CareJourney[]> {
  if (!isTryaMockMode()) {
    const query = new URLSearchParams({ status: params?.status ?? 'active' });
    const { data } = await tryaApi.get<CareJourney[]>(`/citizens/${citizenId}/journeys?${query}`);
    return data;
  }
  await new Promise((r) => setTimeout(r, 400));
  return mockCareJourneys.filter((j) => !j.resolvedAt).slice(0, 2);
}

/**
 * Fetches a single journey by ID.
 * Backend: GET /api/journeys/:journeyId
 */
export async function getJourneyById(journeyId: string): Promise<CareJourney | null> {
  if (!isMockMode()) {
    const { data } = await tryaApi.get<CareJourney>(`/journeys/${journeyId}`);
    return data;
  }
  await new Promise((r) => setTimeout(r, 300));
  return mockCareJourneys.find((j) => j.id === journeyId) ?? null;
}

/**
 * Fetches the clinical intake associated with a journey.
 * Backend: GET /api/intakes/:intakeId
 */
export async function getIntakeForJourney(intakeId: string): Promise<ClinicalIntake | null> {
  if (!isMockMode()) {
    const { data } = await tryaApi.get<ClinicalIntake>(`/intakes/${intakeId}`);
    return data;
  }
  await new Promise((r) => setTimeout(r, 200));
  return mockClinicalIntake;
}

/**
 * Fetches all journeys (active + resolved) for history display.
 * Backend: GET /api/citizens/:citizenId/journeys (no status filter)
 */
export async function getCitizenJourneyHistory(citizenId: string): Promise<CareJourney[]> {
  if (!isMockMode()) {
    const { data } = await tryaApi.get<CareJourney[]>(`/citizens/${citizenId}/journeys`);
    return data;
  }
  await new Promise((r) => setTimeout(r, 400));
  return mockCareJourneys;
}
