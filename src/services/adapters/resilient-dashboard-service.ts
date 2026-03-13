/**
 * ResilientDashboardService — Wraps IDashboardService with circuit breaker fallback.
 *
 * Same pattern as other resilient services:
 *   - 3 consecutive failures → circuit opens for 60s
 *   - Falls back to mock seamlessly
 */

import type {
  DashboardFilters,
  DashboardResponse,
  KPIsResponse,
  BottleneckDTO,
  WeeklyTrendDTO,
} from '@/domain/contracts/platform-backend';
import type { IDashboardService } from './types';

export class ResilientDashboardService implements IDashboardService {
  private _failCount = 0;
  private _circuitOpen = false;
  private _circuitOpenedAt = 0;

  private static readonly THRESHOLD = 3;
  private static readonly COOLDOWN_MS = 60_000;

  constructor(
    private readonly primary: IDashboardService,
    private readonly fallback: IDashboardService,
  ) {}

  async fetchDashboard(filters?: DashboardFilters): Promise<DashboardResponse> {
    return this._withFallback(
      'fetchDashboard',
      () => this.primary.fetchDashboard(filters),
      () => this.fallback.fetchDashboard(filters),
    );
  }

  async fetchKPIs(filters?: DashboardFilters): Promise<KPIsResponse> {
    return this._withFallback(
      'fetchKPIs',
      () => this.primary.fetchKPIs(filters),
      () => this.fallback.fetchKPIs(filters),
    );
  }

  async fetchBottlenecks(filters?: DashboardFilters): Promise<BottleneckDTO[]> {
    return this._withFallback(
      'fetchBottlenecks',
      () => this.primary.fetchBottlenecks(filters),
      () => this.fallback.fetchBottlenecks(filters),
    );
  }

  async fetchWeeklyTrend(filters?: DashboardFilters, weeks?: number): Promise<WeeklyTrendDTO[]> {
    return this._withFallback(
      'fetchWeeklyTrend',
      () => this.primary.fetchWeeklyTrend(filters, weeks),
      () => this.fallback.fetchWeeklyTrend(filters, weeks),
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
      if (elapsed < ResilientDashboardService.COOLDOWN_MS) {
        console.debug(
          `[ResilientDashboard] Circuit open — fallback for ${method} (${Math.round((ResilientDashboardService.COOLDOWN_MS - elapsed) / 1000)}s left)`,
        );
        return fallbackFn();
      }
      console.info('[ResilientDashboard] Circuit half-open — retrying primary');
      this._circuitOpen = false;
      this._failCount = 0;
    }

    try {
      const result = await primaryFn();
      if (this._failCount > 0) {
        console.info(`[ResilientDashboard] ${method} recovered`);
        this._failCount = 0;
      }
      return result;
    } catch (error) {
      this._failCount++;
      console.warn(
        `[ResilientDashboard] ${method} failed (${this._failCount}/${ResilientDashboardService.THRESHOLD}) — falling back`,
        error instanceof Error ? error.message : error,
      );

      if (this._failCount >= ResilientDashboardService.THRESHOLD) {
        this._circuitOpen = true;
        this._circuitOpenedAt = Date.now();
        console.warn(
          `[ResilientDashboard] Circuit OPEN — fallback for ${ResilientDashboardService.COOLDOWN_MS / 1000}s`,
        );
      }

      return fallbackFn();
    }
  }
}
