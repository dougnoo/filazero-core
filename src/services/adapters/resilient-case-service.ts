/**
 * ResilientCaseService — Wraps any ICaseService with automatic fallback.
 *
 * If the primary (API) implementation throws, logs the error and
 * falls back to the secondary (mock) implementation seamlessly.
 * This ensures the UI never breaks during backend integration.
 *
 * Usage:
 *   const service = new ResilientCaseService(apiService, mockService);
 *   // If apiService.getCases() fails → mockService.getCases() is called
 */

import type { Case } from '@/domain/types/case';
import type { CaseStatus } from '@/domain/enums/case-status';
import type { CaseFilters } from '@/services/case-service';
import type { ICaseService } from '../types';

export class ResilientCaseService implements ICaseService {
  private _failCount = 0;
  private _circuitOpen = false;
  private _circuitOpenedAt = 0;

  /** After this many consecutive failures, stop trying API for a cooldown period */
  private static readonly CIRCUIT_THRESHOLD = 3;
  /** Cooldown period in ms before retrying the API after circuit opens */
  private static readonly CIRCUIT_COOLDOWN_MS = 60_000; // 1 minute

  constructor(
    private readonly primary: ICaseService,
    private readonly fallback: ICaseService,
  ) {}

  async getCases(filters?: CaseFilters): Promise<Case[]> {
    return this._withFallback('getCases', () => this.primary.getCases(filters), () => this.fallback.getCases(filters));
  }

  async getCaseById(caseId: string): Promise<Case | null> {
    return this._withFallback('getCaseById', () => this.primary.getCaseById(caseId), () => this.fallback.getCaseById(caseId));
  }

  async getCaseCountsByStatus(): Promise<Record<CaseStatus, number>> {
    return this._withFallback('getCaseCountsByStatus', () => this.primary.getCaseCountsByStatus(), () => this.fallback.getCaseCountsByStatus());
  }

  // ─── Circuit Breaker Logic ────────────────────────────────────

  private async _withFallback<T>(
    method: string,
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
  ): Promise<T> {
    // Check circuit breaker
    if (this._circuitOpen) {
      const elapsed = Date.now() - this._circuitOpenedAt;
      if (elapsed < ResilientCaseService.CIRCUIT_COOLDOWN_MS) {
        console.debug(
          `[ResilientCaseService] Circuit open — using fallback for ${method} (${Math.round((ResilientCaseService.CIRCUIT_COOLDOWN_MS - elapsed) / 1000)}s remaining)`,
        );
        return fallbackFn();
      }
      // Cooldown expired — try primary again
      console.info('[ResilientCaseService] Circuit half-open — retrying primary');
      this._circuitOpen = false;
      this._failCount = 0;
    }

    try {
      const result = await primaryFn();
      // Success — reset failure counter
      if (this._failCount > 0) {
        console.info(`[ResilientCaseService] ${method} recovered — resetting circuit`);
        this._failCount = 0;
      }
      return result;
    } catch (error) {
      this._failCount++;
      console.warn(
        `[ResilientCaseService] ${method} failed (attempt ${this._failCount}/${ResilientCaseService.CIRCUIT_THRESHOLD}) — falling back to mock`,
        error instanceof Error ? error.message : error,
      );

      if (this._failCount >= ResilientCaseService.CIRCUIT_THRESHOLD) {
        this._circuitOpen = true;
        this._circuitOpenedAt = Date.now();
        console.warn(
          `[ResilientCaseService] Circuit OPEN — all calls will use fallback for ${ResilientCaseService.CIRCUIT_COOLDOWN_MS / 1000}s`,
        );
      }

      return fallbackFn();
    }
  }
}
