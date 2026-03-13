/**
 * ResilientIntakeService — Wraps any IIntakeService with automatic fallback.
 *
 * Uses the same Circuit Breaker pattern as ResilientCaseService:
 *   - 3 consecutive failures → circuit opens for 60s
 *   - During cooldown → all calls use mock fallback
 *   - After cooldown → half-open retry
 *
 * Note: getGreetingMessage is synchronous and always succeeds,
 * so it delegates directly to the primary without fallback wrapping.
 */

import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { TriageMessage } from '@/domain/types/triage';
import type { IntakePhase } from '@/services/intake-service';
import type { IIntakeService } from './types';

export class ResilientIntakeService implements IIntakeService {
  private _failCount = 0;
  private _circuitOpen = false;
  private _circuitOpenedAt = 0;

  private static readonly CIRCUIT_THRESHOLD = 3;
  private static readonly CIRCUIT_COOLDOWN_MS = 60_000;

  constructor(
    private readonly primary: IIntakeService,
    private readonly fallback: IIntakeService,
  ) {}

  async sendMessage(
    intakeId: string,
    userMessage: string,
    currentPhase: IntakePhase,
  ): Promise<{ reply: TriageMessage; nextPhase: IntakePhase }> {
    return this._withFallback(
      'sendMessage',
      () => this.primary.sendMessage(intakeId, userMessage, currentPhase),
      () => this.fallback.sendMessage(intakeId, userMessage, currentPhase),
    );
  }

  async generateResult(
    intakeId: string,
    messages: TriageMessage[],
  ): Promise<ClinicalIntake> {
    return this._withFallback(
      'generateResult',
      () => this.primary.generateResult(intakeId, messages),
      () => this.fallback.generateResult(intakeId, messages),
    );
  }

  getGreetingMessage(): TriageMessage {
    // Synchronous — no fallback needed, both return the same greeting
    return this.primary.getGreetingMessage();
  }

  // ─── Circuit Breaker Logic ────────────────────────────────────

  private async _withFallback<T>(
    method: string,
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
  ): Promise<T> {
    if (this._circuitOpen) {
      const elapsed = Date.now() - this._circuitOpenedAt;
      if (elapsed < ResilientIntakeService.CIRCUIT_COOLDOWN_MS) {
        console.debug(
          `[ResilientIntakeService] Circuit open — using FALLBACK (mock) for ${method} (${Math.round((ResilientIntakeService.CIRCUIT_COOLDOWN_MS - elapsed) / 1000)}s remaining)`,
        );
        return fallbackFn();
      }
      console.info('[ResilientIntakeService] Circuit half-open — retrying primary (api)');
      this._circuitOpen = false;
      this._failCount = 0;
    }

    try {
      const result = await primaryFn();
      if (this._failCount > 0) {
        console.info(`[ResilientIntakeService] ${method} recovered — resetting circuit (using api)`);
        this._failCount = 0;
      }
      console.debug(`[ResilientIntakeService] ✅ ${method} — origin: API`);
      return result;
    } catch (error) {
      this._failCount++;
      console.warn(
        `[ResilientIntakeService] ${method} failed (attempt ${this._failCount}/${ResilientIntakeService.CIRCUIT_THRESHOLD}) — falling back to MOCK`,
        error instanceof Error ? error.message : error,
      );

      if (this._failCount >= ResilientIntakeService.CIRCUIT_THRESHOLD) {
        this._circuitOpen = true;
        this._circuitOpenedAt = Date.now();
        console.warn(
          `[ResilientIntakeService] Circuit OPEN — all calls will use MOCK fallback for ${ResilientIntakeService.CIRCUIT_COOLDOWN_MS / 1000}s`,
        );
      }

      return fallbackFn();
    }
  }
}
