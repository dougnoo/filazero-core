/**
 * ResilientClinicalReviewService — Wraps IClinicalReviewService with circuit breaker fallback.
 *
 * Same pattern as ResilientCaseService:
 *   - 3 consecutive failures → circuit opens for 60s
 *   - Falls back to mock seamlessly
 */

import type {
  ValidationRequest,
  ValidationResponse,
  ClinicalPackageListParams,
} from '@/domain/contracts/trya-backend';
import type { ClinicalPackage } from '@/services/clinical-review-service';
import type { IClinicalReviewService } from './types';

export class ResilientClinicalReviewService implements IClinicalReviewService {
  private _failCount = 0;
  private _circuitOpen = false;
  private _circuitOpenedAt = 0;

  private static readonly THRESHOLD = 3;
  private static readonly COOLDOWN_MS = 60_000;

  constructor(
    private readonly primary: IClinicalReviewService,
    private readonly fallback: IClinicalReviewService,
  ) {}

  async getPendingPackages(
    params?: Omit<ClinicalPackageListParams, 'status'>,
  ): Promise<ClinicalPackage[]> {
    return this._withFallback(
      'getPendingPackages',
      () => this.primary.getPendingPackages(params),
      () => this.fallback.getPendingPackages(params),
    );
  }

  async getAllPackages(params?: ClinicalPackageListParams): Promise<ClinicalPackage[]> {
    return this._withFallback(
      'getAllPackages',
      () => this.primary.getAllPackages(params),
      () => this.fallback.getAllPackages(params),
    );
  }

  async getPackageById(journeyId: string): Promise<ClinicalPackage | null> {
    return this._withFallback(
      'getPackageById',
      () => this.primary.getPackageById(journeyId),
      () => this.fallback.getPackageById(journeyId),
    );
  }

  async submitValidation(payload: ValidationRequest): Promise<ValidationResponse> {
    return this._withFallback(
      'submitValidation',
      () => this.primary.submitValidation(payload),
      () => this.fallback.submitValidation(payload),
    );
  }

  // ─── Circuit Breaker ─────────────────────────────────────────

  private async _withFallback<T>(
    method: string,
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
  ): Promise<T> {
    if (this._circuitOpen) {
      const elapsed = Date.now() - this._circuitOpenedAt;
      if (elapsed < ResilientClinicalReviewService.COOLDOWN_MS) {
        console.debug(
          `[ResilientClinicalReview] Circuit open — fallback for ${method} (${Math.round((ResilientClinicalReviewService.COOLDOWN_MS - elapsed) / 1000)}s left)`,
        );
        return fallbackFn();
      }
      console.info('[ResilientClinicalReview] Circuit half-open — retrying primary');
      this._circuitOpen = false;
      this._failCount = 0;
    }

    try {
      const result = await primaryFn();
      if (this._failCount > 0) {
        console.info(`[ResilientClinicalReview] ${method} recovered`);
        this._failCount = 0;
      }
      return result;
    } catch (error) {
      this._failCount++;
      console.warn(
        `[ResilientClinicalReview] ${method} failed (${this._failCount}/${ResilientClinicalReviewService.THRESHOLD}) — falling back`,
        error instanceof Error ? error.message : error,
      );

      if (this._failCount >= ResilientClinicalReviewService.THRESHOLD) {
        this._circuitOpen = true;
        this._circuitOpenedAt = Date.now();
        console.warn(
          `[ResilientClinicalReview] Circuit OPEN — fallback for ${ResilientClinicalReviewService.COOLDOWN_MS / 1000}s`,
        );
      }

      return fallbackFn();
    }
  }
}
