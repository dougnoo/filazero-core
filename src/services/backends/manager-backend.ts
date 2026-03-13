/**
 * Manager Backend — All services consumed by the Gestor (health manager) channel.
 *
 * Aggregates: operational dashboards, clinical analytics, bottleneck detection.
 * In DEMO_MODE: 100% mock, zero network calls.
 */

// ─── Dashboard (operational intelligence) ───────────────────────
export {
  fetchDashboardData,
  fetchKPIs,
  fetchBottlenecks,
  fetchWeeklyTrend,
  type DashboardData,
  type DashboardKPIs,
  type SpecialtyMetric,
  type JourneyStatusBreakdown,
  type RiskDistribution,
  type Bottleneck,
  type WeeklyTrend,
} from '@/services/dashboard-service';

// ─── Clinical review stats (read-only, for manager visibility) ──
export {
  getAllClinicalPackages,
  type ClinicalPackage,
} from '@/services/clinical-review-service';

// ─── Clinical mock stats (for dashboard widgets) ────────────────
export { mockClinicalDashboardStats } from '@/lib/mock-clinical-data';

// ─── Auth ───────────────────────────────────────────────────────
export { authService } from '@/services/auth-service';
