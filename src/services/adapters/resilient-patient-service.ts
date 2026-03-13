/**
 * ResilientPatientService — Wraps any IPatientService with automatic fallback.
 *
 * Uses the same Circuit Breaker pattern as ResilientCaseService:
 *   - 3 consecutive failures → circuit opens for 60s
 *   - During cooldown → all calls use mock fallback
 *   - After cooldown → half-open retry
 */

import type { Patient } from '@/domain/types/case';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { IPatientService } from './types';

export class ResilientPatientService implements IPatientService {
  private _failCount = 0;
  private _circuitOpen = false;
  private _circuitOpenedAt = 0;

  private static readonly CIRCUIT_THRESHOLD = 3;
  private static readonly CIRCUIT_COOLDOWN_MS = 60_000;

  constructor(
    private readonly primary: IPatientService,
    private readonly fallback: IPatientService,
  ) {}

  async getPatientById(patientId: string): Promise<Patient | null> {
    return this._withFallback(
      'getPatientById',
      () => this.primary.getPatientById(patientId),
      () => this.fallback.getPatientById(patientId),
    );
  }

  async searchPatientByCPF(cpf: string): Promise<Patient | null> {
    return this._withFallback(
      'searchPatientByCPF',
      () => this.primary.searchPatientByCPF(cpf),
      () => this.fallback.searchPatientByCPF(cpf),
    );
  }

  async getPatientClinicalHistory(patientId: string): Promise<ClinicalIntake[]> {
    return this._withFallback(
      'getPatientClinicalHistory',
      () => this.primary.getPatientClinicalHistory(patientId),
      () => this.fallback.getPatientClinicalHistory(patientId),
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
      if (elapsed < ResilientPatientService.CIRCUIT_COOLDOWN_MS) {
        console.debug(
          `[ResilientPatientService] Circuit open — using fallback for ${method} (${Math.round((ResilientPatientService.CIRCUIT_COOLDOWN_MS - elapsed) / 1000)}s remaining)`,
        );
        return fallbackFn();
      }
      console.info('[ResilientPatientService] Circuit half-open — retrying primary');
      this._circuitOpen = false;
      this._failCount = 0;
    }

    try {
      const result = await primaryFn();
      if (this._failCount > 0) {
        console.info(`[ResilientPatientService] ${method} recovered — resetting circuit`);
        this._failCount = 0;
      }
      return result;
    } catch (error) {
      this._failCount++;
      console.warn(
        `[ResilientPatientService] ${method} failed (attempt ${this._failCount}/${ResilientPatientService.CIRCUIT_THRESHOLD}) — falling back to mock`,
        error instanceof Error ? error.message : error,
      );

      if (this._failCount >= ResilientPatientService.CIRCUIT_THRESHOLD) {
        this._circuitOpen = true;
        this._circuitOpenedAt = Date.now();
        console.warn(
          `[ResilientPatientService] Circuit OPEN — all calls will use fallback for ${ResilientPatientService.CIRCUIT_COOLDOWN_MS / 1000}s`,
        );
      }

      return fallbackFn();
    }
  }
}
