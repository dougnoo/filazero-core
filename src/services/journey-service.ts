/**
 * Journey Service — Abstraction for fetching citizen care journey data.
 * 
 * Mock mode: returns local data.
 * Real mode: calls trya-backend REST API.
 */

import type { CareJourney } from '@/domain/types/care-journey';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import { mockCareJourneys, mockClinicalIntake } from '@/lib/mock-clinical-data';
import { isMockMode } from '@/lib/env';
import { tryaApi } from '@/lib/api-client';

/**
 * Fetches active care journeys for the current citizen.
 */
export async function getCitizenJourneys(citizenId: string): Promise<CareJourney[]> {
  if (!isMockMode()) {
    const { data } = await tryaApi.get<CareJourney[]>(`/citizens/${citizenId}/journeys?status=active`);
    return data;
  }
  await new Promise((r) => setTimeout(r, 400));
  return mockCareJourneys.filter((j) => !j.resolvedAt).slice(0, 2);
}

/**
 * Fetches a single journey by ID.
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
 */
export async function getIntakeForJourney(_intakeId: string): Promise<ClinicalIntake | null> {
  await new Promise((r) => setTimeout(r, 200));
  return mockClinicalIntake;
}

/**
 * Fetches all journeys (active + resolved) for history display.
 */
export async function getCitizenJourneyHistory(_citizenId: string): Promise<CareJourney[]> {
  await new Promise((r) => setTimeout(r, 400));
  return mockCareJourneys;
}
