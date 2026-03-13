/**
 * Platform-Backend Frontend Contract
 * ===================================
 * Defines the exact request/response shapes expected from
 * platform-backend (NestJS) for manager analytics & operational intelligence.
 *
 * Base URL: env.PLATFORM_BACKEND_URL
 * Auth: Bearer JWT (injected by api-client)
 * Tenant: X-Municipality-Id / X-Unit-Id headers (injected by api-client)
 *
 * ─── Endpoints ──────────────────────────────────────────────────
 *
 * GET  /api/manager/dashboard
 *   Query: DashboardFilters
 *   Response: DashboardResponse
 *
 * GET  /api/manager/dashboard/kpis
 *   Query: DashboardFilters
 *   Response: KPIsResponse
 *
 * GET  /api/manager/dashboard/specialty-metrics
 *   Query: DashboardFilters
 *   Response: SpecialtyMetricDTO[]
 *
 * GET  /api/manager/dashboard/bottlenecks
 *   Query: DashboardFilters
 *   Response: BottleneckDTO[]
 *
 * GET  /api/manager/dashboard/weekly-trend
 *   Query: DashboardFilters & { weeks?: number }
 *   Response: WeeklyTrendDTO[]
 *
 * GET  /api/manager/dashboard/risk-distribution
 *   Query: DashboardFilters
 *   Response: RiskDistributionDTO[]
 *
 * GET  /api/manager/dashboard/journey-breakdown
 *   Query: DashboardFilters
 *   Response: JourneyBreakdownDTO[]
 *
 * GET  /api/manager/dashboard/resolution-split
 *   Query: DashboardFilters
 *   Response: ResolutionSplitDTO
 */

import { RiskLevel } from '@/domain/enums/risk-level';
import { CareJourneyStatus } from '@/domain/enums/care-journey-status';

// ─── Filters ────────────────────────────────────────────────────

/** Query parameters accepted by all dashboard endpoints. */
export interface DashboardFilters {
  /** ISO municipality ID (from tenant context or explicit override for admins). */
  municipalityId?: string;
  /** Health unit ID within the municipality. */
  unitId?: string;
  /** ISO date string — start of reporting period. */
  dateFrom?: string;
  /** ISO date string — end of reporting period. */
  dateTo?: string;
  /** Filter by specialty (e.g. "Cardiologia"). */
  specialty?: string;
  /** Filter by Manchester risk level. */
  riskLevel?: RiskLevel;
  /** Filter by journey status. */
  journeyStatus?: CareJourneyStatus;
}

/** Serializes filters into URLSearchParams for GET requests. */
export function filtersToParams(filters: DashboardFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.municipalityId) params.set('municipalityId', filters.municipalityId);
  if (filters.unitId) params.set('unitId', filters.unitId);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.specialty) params.set('specialty', filters.specialty);
  if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
  if (filters.journeyStatus) params.set('journeyStatus', filters.journeyStatus);
  return params;
}

// ─── KPIs DTO ───────────────────────────────────────────────────

export interface KPIsResponse {
  /** Total active care journeys across all statuses. */
  totalActiveJourneys: number;
  /** % of cases resolved at primary care (UBS) without referral. */
  resolvedAtPrimaryRate: number;
  /** % of cases referred to specialist. */
  referralRate: number;
  /** Average days from intake to resolution. */
  avgTimeToResolutionDays: number;
  /** Clinical packages awaiting medical review. */
  pendingClinicalReviews: number;
  /** Exams ordered but not yet completed. */
  pendingExams: number;
  /** Cases waiting for specialist appointment. */
  awaitingSpecialist: number;
  /** Number of intakes performed today. */
  intakesToday: number;
  /** Average intake session duration in minutes. */
  avgIntakeDurationMinutes: number;
  /** Currently active health professionals. */
  activeProfessionals: number;
  /** Attendances completed per hour (current shift). */
  throughputPerHour: number;
}

// ─── Specialty Metrics ──────────────────────────────────────────

export interface SpecialtyMetricDTO {
  /** Specialty name (e.g. "Cardiologia"). */
  specialty: string;
  /** Total referrals to this specialty in period. */
  referralCount: number;
  /** Average wait time in days for this specialty. */
  avgWaitDays: number;
  /** Currently pending referrals. */
  pendingCount: number;
}

// ─── Journey Breakdown ──────────────────────────────────────────

export interface JourneyBreakdownDTO {
  status: CareJourneyStatus;
  /** Human-readable label (may come from backend or be mapped on frontend). */
  label: string;
  /** Number of journeys in this status. */
  count: number;
}

// ─── Risk Distribution ──────────────────────────────────────────

export interface RiskDistributionDTO {
  level: RiskLevel;
  /** Number of active journeys with this risk level. */
  count: number;
}

// ─── Bottlenecks ────────────────────────────────────────────────

export interface BottleneckDTO {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  /** Short bottleneck title. */
  title: string;
  /** Detailed description of the operational issue. */
  description: string;
  /** Current metric value (e.g. "14 pendentes"). */
  metric: string;
  /** Target/threshold (e.g. "Meta: <5"). */
  threshold: string;
}

// ─── Weekly Trend ───────────────────────────────────────────────

export interface WeeklyTrendDTO {
  /** Day label (e.g. "Seg", "Ter") or ISO date. */
  day: string;
  /** Number of intakes on this day. */
  intakes: number;
  /** Number of cases resolved on this day. */
  resolved: number;
  /** Number of cases referred on this day. */
  referred: number;
}

// ─── Resolution Split ───────────────────────────────────────────

export interface ResolutionSplitDTO {
  /** % resolved at primary care. */
  resolvedPrimary: number;
  /** % referred to specialist. */
  referredOut: number;
}

// ─── Aggregated Dashboard Response ──────────────────────────────

/** Full response from GET /api/manager/dashboard. */
export interface DashboardResponse {
  kpis: KPIsResponse;
  specialtyMetrics: SpecialtyMetricDTO[];
  journeyBreakdown: JourneyBreakdownDTO[];
  riskDistribution: RiskDistributionDTO[];
  bottlenecks: BottleneckDTO[];
  weeklyTrend: WeeklyTrendDTO[];
  resolutionSplit: ResolutionSplitDTO;
}
