/**
 * Journey Service — Abstraction for fetching citizen care journey data.
 * 
 * Currently returns mock data. Will be replaced by:
 * - trya-backend (journey state, steps, status)
 * - trya-platform-backend (regulation, scheduling)
 * 
 * Contract: fetch active journeys for a citizen, return CareJourney[].
 */

import type { CareJourney } from '@/domain/types/care-journey';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import { mockCareJourneys, mockClinicalIntake } from '@/lib/mock-clinical-data';

/**
 * Fetches active care journeys for the current citizen.
 */
export async function getCitizenJourneys(_citizenId: string): Promise<CareJourney[]> {
  await new Promise((r) => setTimeout(r, 400));
  // Return first two as "active" for the mock citizen
  return mockCareJourneys.filter((j) => !j.resolvedAt).slice(0, 2);
}

/**
 * Fetches a single journey by ID.
 */
export async function getJourneyById(journeyId: string): Promise<CareJourney | null> {
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
