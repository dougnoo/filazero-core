/**
 * ApiDashboardService — Real implementation for platform-backend.
 *
 * Connects to:
 *   GET /api/manager/dashboard              → full aggregated dashboard
 *   GET /api/manager/dashboard/kpis         → KPIs only
 *   GET /api/manager/dashboard/bottlenecks  → bottleneck alerts
 *   GET /api/manager/dashboard/weekly-trend → weekly trend chart data
 *
 * Base URL: env.PLATFORM_BACKEND_URL
 * Auth: Bearer JWT + X-Municipality-Id + X-Unit-Id (via api-client.ts)
 *
 * ─── DTO Mapping ───────────────────────────────────────────────────
 * Handles both camelCase and snake_case payloads from platform-backend.
 * All read-only — no write operations on the dashboard.
 */

import { platformApi } from '@/lib/api-client';
import { filtersToParams } from '@/domain/contracts/platform-backend';
import type {
  DashboardFilters,
  DashboardResponse,
  KPIsResponse,
  BottleneckDTO,
  WeeklyTrendDTO,
  SpecialtyMetricDTO,
  JourneyBreakdownDTO,
  RiskDistributionDTO,
  ResolutionSplitDTO,
} from '@/domain/contracts/platform-backend';
import type { IDashboardService } from '../types';

const isDev = import.meta.env.DEV;

function debugLog(label: string, ...args: unknown[]) {
  if (!isDev) return;
  console.log(`[ApiDashboardService][${label}]`, ...args);
}

// ═══════════════════════════════════════════════════════════════════
// §1 — DTO Mappers (snake_case → camelCase normalization)
// ═══════════════════════════════════════════════════════════════════

function pick<T>(primary: T | undefined, fallback: T | undefined, defaultVal: T): T {
  return primary ?? fallback ?? defaultVal;
}

function mapKPIs(d: Record<string, unknown>): KPIsResponse {
  return {
    totalActiveJourneys: pick(d.totalActiveJourneys, d.total_active_journeys, 0) as number,
    resolvedAtPrimaryRate: pick(d.resolvedAtPrimaryRate, d.resolved_at_primary_rate, 0) as number,
    referralRate: pick(d.referralRate, d.referral_rate, 0) as number,
    avgTimeToResolutionDays: pick(d.avgTimeToResolutionDays, d.avg_time_to_resolution_days, 0) as number,
    pendingClinicalReviews: pick(d.pendingClinicalReviews, d.pending_clinical_reviews, 0) as number,
    pendingExams: pick(d.pendingExams, d.pending_exams, 0) as number,
    awaitingSpecialist: pick(d.awaitingSpecialist, d.awaiting_specialist, 0) as number,
    intakesToday: pick(d.intakesToday, d.intakes_today, 0) as number,
    avgIntakeDurationMinutes: pick(d.avgIntakeDurationMinutes, d.avg_intake_duration_minutes, 0) as number,
    activeProfessionals: pick(d.activeProfessionals, d.active_professionals, 0) as number,
    throughputPerHour: pick(d.throughputPerHour, d.throughput_per_hour, 0) as number,
  };
}

function mapSpecialtyMetrics(raw: Record<string, unknown>[]): SpecialtyMetricDTO[] {
  return (raw ?? []).map((d) => ({
    specialty: (d.specialty as string) ?? '',
    referralCount: pick(d.referralCount, d.referral_count, 0) as number,
    avgWaitDays: pick(d.avgWaitDays, d.avg_wait_days, 0) as number,
    pendingCount: pick(d.pendingCount, d.pending_count, 0) as number,
  }));
}

function mapJourneyBreakdown(raw: Record<string, unknown>[]): JourneyBreakdownDTO[] {
  return (raw ?? []).map((d) => ({
    status: (d.status as string) as JourneyBreakdownDTO['status'],
    label: (d.label as string) ?? '',
    count: (d.count as number) ?? 0,
  }));
}

function mapRiskDistribution(raw: Record<string, unknown>[]): RiskDistributionDTO[] {
  return (raw ?? []).map((d) => ({
    level: (d.level as string) as RiskDistributionDTO['level'],
    count: (d.count as number) ?? 0,
  }));
}

function mapBottlenecks(raw: Record<string, unknown>[]): BottleneckDTO[] {
  return (raw ?? []).map((d) => ({
    id: (d.id as string) ?? '',
    severity: (d.severity as BottleneckDTO['severity']) ?? 'info',
    title: (d.title as string) ?? '',
    description: (d.description as string) ?? '',
    metric: (d.metric as string) ?? '',
    threshold: (d.threshold as string) ?? '',
  }));
}

function mapWeeklyTrend(raw: Record<string, unknown>[]): WeeklyTrendDTO[] {
  return (raw ?? []).map((d) => ({
    day: (d.day as string) ?? '',
    intakes: (d.intakes as number) ?? 0,
    resolved: (d.resolved as number) ?? 0,
    referred: (d.referred as number) ?? 0,
  }));
}

function mapResolutionSplit(d: Record<string, unknown>): ResolutionSplitDTO {
  return {
    resolvedPrimary: pick(d.resolvedPrimary, d.resolved_primary, 0) as number,
    referredOut: pick(d.referredOut, d.referred_out, 0) as number,
  };
}

function mapDashboardResponse(raw: Record<string, unknown>): DashboardResponse {
  return {
    kpis: mapKPIs((raw.kpis ?? raw.kpi_s ?? {}) as Record<string, unknown>),
    specialtyMetrics: mapSpecialtyMetrics(
      (raw.specialtyMetrics ?? raw.specialty_metrics ?? []) as Record<string, unknown>[],
    ),
    journeyBreakdown: mapJourneyBreakdown(
      (raw.journeyBreakdown ?? raw.journey_breakdown ?? []) as Record<string, unknown>[],
    ),
    riskDistribution: mapRiskDistribution(
      (raw.riskDistribution ?? raw.risk_distribution ?? []) as Record<string, unknown>[],
    ),
    bottlenecks: mapBottlenecks((raw.bottlenecks ?? []) as Record<string, unknown>[]),
    weeklyTrend: mapWeeklyTrend(
      (raw.weeklyTrend ?? raw.weekly_trend ?? []) as Record<string, unknown>[],
    ),
    resolutionSplit: mapResolutionSplit(
      (raw.resolutionSplit ?? raw.resolution_split ?? {}) as Record<string, unknown>,
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════
// §2 — ApiDashboardService
// ═══════════════════════════════════════════════════════════════════

function buildQuery(filters?: DashboardFilters, extra?: Record<string, string>): string {
  const params = filtersToParams(filters ?? {});
  if (extra) Object.entries(extra).forEach(([k, v]) => params.set(k, v));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export class ApiDashboardService implements IDashboardService {
  /**
   * GET /api/manager/dashboard
   */
  async fetchDashboard(filters?: DashboardFilters): Promise<DashboardResponse> {
    const path = `/api/manager/dashboard${buildQuery(filters)}`;
    debugLog('FETCH_DASHBOARD', { path });

    const { data } = await platformApi.get<Record<string, unknown>>(path);

    debugLog('FETCH_DASHBOARD_RESPONSE', { keys: Object.keys(data) });
    return mapDashboardResponse(data);
  }

  /**
   * GET /api/manager/dashboard/kpis
   */
  async fetchKPIs(filters?: DashboardFilters): Promise<KPIsResponse> {
    const path = `/api/manager/dashboard/kpis${buildQuery(filters)}`;
    debugLog('FETCH_KPIS', { path });

    const { data } = await platformApi.get<Record<string, unknown>>(path);

    debugLog('FETCH_KPIS_RESPONSE', data);
    return mapKPIs(data);
  }

  /**
   * GET /api/manager/dashboard/bottlenecks
   */
  async fetchBottlenecks(filters?: DashboardFilters): Promise<BottleneckDTO[]> {
    const path = `/api/manager/dashboard/bottlenecks${buildQuery(filters)}`;
    debugLog('FETCH_BOTTLENECKS', { path });

    const { data } = await platformApi.get<Record<string, unknown>[]>(path);

    debugLog('FETCH_BOTTLENECKS_RESPONSE', { count: data.length });
    return mapBottlenecks(data);
  }

  /**
   * GET /api/manager/dashboard/weekly-trend
   */
  async fetchWeeklyTrend(filters?: DashboardFilters, weeks?: number): Promise<WeeklyTrendDTO[]> {
    const path = `/api/manager/dashboard/weekly-trend${buildQuery(filters, weeks ? { weeks: String(weeks) } : undefined)}`;
    debugLog('FETCH_WEEKLY_TREND', { path });

    const { data } = await platformApi.get<Record<string, unknown>[]>(path);

    debugLog('FETCH_WEEKLY_TREND_RESPONSE', { count: data.length });
    return mapWeeklyTrend(data);
  }
}
