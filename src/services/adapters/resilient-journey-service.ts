/**
 * ResilientJourneyService — Wraps any IJourneyService with automatic fallback.
 *
 * Uses the same Circuit Breaker pattern as other resilient services:
 *   - 3 consecutive failures → circuit opens for 60s
 *   - During cooldown → all calls use mock fallback
 *   - After cooldown → half-open retry
 */

import type { CareJourney } from '@/domain/types/care-journey';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { JourneyListParams } from '@/domain/contracts/trya-backend';
import type { IJourneyService } from './types';

export class ResilientJourneyService implements IJourneyService {
  private _failCount = 0;
  private _circuitOpen = false;
  private _circuitOpenedAt = 0;

  private static readonly CIRCUIT_THRESHOLD = 3;
  private static readonly CIRCUIT_COOLDOWN_MS = 60_000;

  constructor(
    private readonly primary: IJourneyService,
    private readonly fallback: IJourneyService,
  ) {}

  async getCitizenJourneys(citizenId: string, params?: JourneyListParams): Promise<CareJourney[]> {
    return this._withFallback(
      'getCitizenJourneys',
      () => this.primary.getCitizenJourneys(citizenId, params),
      () => this.fallback.getCitizenJourneys(citizenId, params),
    );
  }

  async getJourneyById(journeyId: string): Promise<CareJourney | null> {
    return this._withFallback(
      'getJourneyById',
      () => this.primary.getJourneyById(journeyId),
      () => this.fallback.getJourneyById(journeyId),
    );
  }

  async getIntakeForJourney(intakeId: string): Promise<ClinicalIntake | null> {
    return this._withFallback(
      'getIntakeForJourney',
      () => this.primary.getIntakeForJourney(intakeId),
      () => this.fallback.getIntakeForJourney(intakeId),
    );
  }

  async getCitizenJourneyHistory(citizenId: string): Promise<CareJourney[]> {
    return this._withFallback(
      'getCitizenJourneyHistory',
      () => this.primary.getCitizenJourneyHistory(citizenId),
      () => this.fallback.getCitizenJourneyHistory(citizenId),
    );
  }

  // ─── Circuit Breaker Logic ────────────────────────────────────

  private async _withFallback<T>(
    method: string,
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
  ): Promise<T> {
    if (this._circuitOpen) {
      const elapsed = Date.now() - this._circuitOpenedAt;
      if (elapsed < ResilientJourneyService.CIRCUIT_COOLDOWN_MS) {
        console.debug(
          `[ResilientJourneyService] Circuit open — using fallback for ${method} (${Math.round((ResilientJourneyService.CIRCUIT_COOLDOWN_MS - elapsed) / 1000)}s remaining)`,
        );
        return fallbackFn();
      }
      console.info('[ResilientJourneyService] Circuit half-open — retrying primary');
      this._circuitOpen = false;
      this._failCount = 0;
    }

    try {
      const result = await primaryFn();
      if (this._failCount > 0) {
        console.info(`[ResilientJourneyService] ${method} recovered — resetting circuit`);
        this._failCount = 0;
      }
      return result;
    } catch (error) {
      this._failCount++;
      console.warn(
        `[ResilientJourneyService] ${method} failed (attempt ${this._failCount}/${ResilientJourneyService.CIRCUIT_THRESHOLD}) — falling back to mock`,
        error instanceof Error ? error.message : error,
      );

      if (this._failCount >= ResilientJourneyService.CIRCUIT_THRESHOLD) {
        this._circuitOpen = true;
        this._circuitOpenedAt = Date.now();
        console.warn(
          `[ResilientJourneyService] Circuit OPEN — all calls will use fallback for ${ResilientJourneyService.CIRCUIT_COOLDOWN_MS / 1000}s`,
        );
      }

      return fallbackFn();
    }
  }
}
