/**
 * Manager Backend — All services consumed by the Gestor (health manager) channel.
 *
 * Now delegates to the service adapter layer (factory picks mock vs real API).
 * In DEMO_MODE: 100% mock, zero network calls.
 */

import { services } from '@/services/adapters';

// ─── Dashboard (operational intelligence) ───────────────────────
export const fetchDashboardData = services.dashboard.fetchDashboard.bind(services.dashboard);
export const fetchKPIs = services.dashboard.fetchKPIs.bind(services.dashboard);
export const fetchBottlenecks = services.dashboard.fetchBottlenecks.bind(services.dashboard);
export const fetchWeeklyTrend = services.dashboard.fetchWeeklyTrend.bind(services.dashboard);
export type {
  DashboardData,
  DashboardKPIs,
  SpecialtyMetric,
  JourneyStatusBreakdown,
  RiskDistribution,
  Bottleneck,
  WeeklyTrend,
} from '@/services/dashboard-service';

// ─── Clinical review stats (read-only, for manager visibility) ──
export const getAllClinicalPackages = services.clinicalReview.getAllPackages.bind(services.clinicalReview);
export type { ClinicalPackage } from '@/services/clinical-review-service';

// ─── Clinical mock stats (for dashboard widgets) ────────────────
export { mockClinicalDashboardStats } from '@/mock';

// ─── Auth ───────────────────────────────────────────────────────
export { authService } from '@/services/auth-service';
