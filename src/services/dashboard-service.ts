/**
 * Dashboard Service — Manager operational intelligence.
 *
 * Dual-path: mock data when ENABLE_REAL_BACKEND is off,
 * real platform-backend API when enabled.
 *
 * Backend: platform-backend (NestJS)
 * Endpoint: GET /api/manager/dashboard
 */

import { RiskLevel } from '@/domain/enums/risk-level';
import { CareJourneyStatus } from '@/domain/enums/care-journey-status';
import { isPlatformMockMode } from '@/lib/env';
import { platformApi } from '@/lib/api-client';
import type {
  DashboardFilters,
  DashboardResponse,
  KPIsResponse,
  SpecialtyMetricDTO,
  JourneyBreakdownDTO,
  RiskDistributionDTO,
  BottleneckDTO,
  WeeklyTrendDTO,
  ResolutionSplitDTO,
} from '@/domain/contracts/platform-backend';
import { filtersToParams } from '@/domain/contracts/platform-backend';

// ─── Re-export contract types as domain types ───────────────────
// Keep backward-compatible aliases used by ClinicalDashboard.tsx

export type DashboardKPIs = KPIsResponse;
export type SpecialtyMetric = SpecialtyMetricDTO;
export type JourneyStatusBreakdown = JourneyBreakdownDTO;
export type RiskDistribution = RiskDistributionDTO;
export type Bottleneck = BottleneckDTO;
export type WeeklyTrend = WeeklyTrendDTO;

export interface DashboardData {
  kpis: DashboardKPIs;
  specialtyMetrics: SpecialtyMetric[];
  journeyBreakdown: JourneyStatusBreakdown[];
  riskDistribution: RiskDistribution[];
  bottlenecks: Bottleneck[];
  weeklyTrend: WeeklyTrend[];
  resolutionSplit: ResolutionSplitDTO;
}

// ─── Mock data generation ───────────────────────────────────────

function generateMockDashboardData(): DashboardData {
  const kpis: DashboardKPIs = {
    totalActiveJourneys: 142,
    resolvedAtPrimaryRate: 68,
    referralRate: 32,
    avgTimeToResolutionDays: 4.2,
    pendingClinicalReviews: 14,
    pendingExams: 34,
    awaitingSpecialist: 27,
    intakesToday: 23,
    avgIntakeDurationMinutes: 8,
    activeProfessionals: 6,
    throughputPerHour: 8.5,
  };

  const specialtyMetrics: SpecialtyMetric[] = [
    { specialty: 'Cardiologia', referralCount: 12, avgWaitDays: 18, pendingCount: 5 },
    { specialty: 'Ortopedia', referralCount: 9, avgWaitDays: 25, pendingCount: 7 },
    { specialty: 'Neurologia', referralCount: 7, avgWaitDays: 22, pendingCount: 4 },
    { specialty: 'Endocrinologia', referralCount: 6, avgWaitDays: 30, pendingCount: 6 },
    { specialty: 'Pneumologia', referralCount: 5, avgWaitDays: 14, pendingCount: 2 },
    { specialty: 'Dermatologia', referralCount: 4, avgWaitDays: 35, pendingCount: 3 },
  ];

  const journeyBreakdown: JourneyStatusBreakdown[] = [
    { status: CareJourneyStatus.INTAKE, label: 'Em Acolhimento', count: 8 },
    { status: CareJourneyStatus.TRIAGE_COMPLETE, label: 'Triagem Concluída', count: 12 },
    { status: CareJourneyStatus.EXAMS_PENDING, label: 'Exames Pendentes', count: 34 },
    { status: CareJourneyStatus.EXAMS_COMPLETE, label: 'Exames Concluídos', count: 11 },
    { status: CareJourneyStatus.REFERRAL_PENDING, label: 'Encaminhamento Pendente', count: 18 },
    { status: CareJourneyStatus.REFERRAL_SCHEDULED, label: 'Encaminhamento Agendado', count: 15 },
    { status: CareJourneyStatus.AWAITING_SPECIALIST, label: 'Aguardando Especialista', count: 27 },
    { status: CareJourneyStatus.IN_ATTENDANCE, label: 'Em Atendimento', count: 6 },
    { status: CareJourneyStatus.FOLLOW_UP, label: 'Acompanhamento', count: 11 },
  ];

  const riskDistribution: RiskDistribution[] = [
    { level: RiskLevel.EMERGENCY, count: 2 },
    { level: RiskLevel.VERY_URGENT, count: 8 },
    { level: RiskLevel.URGENT, count: 42 },
    { level: RiskLevel.LESS_URGENT, count: 61 },
    { level: RiskLevel.NON_URGENT, count: 29 },
  ];

  const bottlenecks: Bottleneck[] = [
    {
      id: 'bn-1',
      severity: 'critical',
      title: 'Revisões clínicas acumuladas',
      description: '14 pacotes clínicos aguardando revisão médica há mais de 24h.',
      metric: '14 pendentes',
      threshold: 'Meta: <5',
    },
    {
      id: 'bn-2',
      severity: 'warning',
      title: 'Espera longa em Endocrinologia',
      description: 'Tempo médio de espera para Endocrinologia está em 30 dias, acima da meta de 21 dias.',
      metric: '30 dias',
      threshold: 'Meta: 21 dias',
    },
    {
      id: 'bn-3',
      severity: 'warning',
      title: 'Alta concentração de exames pendentes',
      description: '34 exames aguardando realização. Possível gargalo no laboratório ou imagiologia.',
      metric: '34 pendentes',
      threshold: 'Meta: <20',
    },
    {
      id: 'bn-4',
      severity: 'info',
      title: 'Taxa de resolução primária estável',
      description: '68% dos casos resolvidos na atenção básica. Meta municipal: 70%.',
      metric: '68%',
      threshold: 'Meta: 70%',
    },
  ];

  const weeklyTrend: WeeklyTrend[] = [
    { day: 'Seg', intakes: 28, resolved: 18, referred: 8 },
    { day: 'Ter', intakes: 32, resolved: 22, referred: 10 },
    { day: 'Qua', intakes: 25, resolved: 16, referred: 7 },
    { day: 'Qui', intakes: 30, resolved: 20, referred: 9 },
    { day: 'Sex', intakes: 23, resolved: 15, referred: 6 },
    { day: 'Sáb', intakes: 12, resolved: 8, referred: 3 },
    { day: 'Dom', intakes: 5, resolved: 3, referred: 1 },
  ];

  return {
    kpis,
    specialtyMetrics,
    journeyBreakdown,
    riskDistribution,
    bottlenecks,
    weeklyTrend,
    resolutionSplit: { resolvedPrimary: 68, referredOut: 32 },
  };
}

// ─── Service functions ──────────────────────────────────────────

/**
 * Fetch the full aggregated dashboard.
 * Real mode: GET /api/manager/dashboard?filters
 * Mock mode: returns static demo data.
 */
export async function fetchDashboardData(filters: DashboardFilters = {}): Promise<DashboardData> {
  if (!isPlatformMockMode()) {
    const qs = filtersToParams(filters).toString();
    const path = `/api/manager/dashboard${qs ? `?${qs}` : ''}`;
    const { data } = await platformApi.get<DashboardResponse>(path);
    return data;
  }
  await new Promise((r) => setTimeout(r, 400));
  return generateMockDashboardData();
}

/**
 * Fetch only KPIs (lighter payload for header widgets).
 */
export async function fetchKPIs(filters: DashboardFilters = {}): Promise<DashboardKPIs> {
  if (!isMockMode()) {
    const qs = filtersToParams(filters).toString();
    const path = `/api/manager/dashboard/kpis${qs ? `?${qs}` : ''}`;
    const { data } = await platformApi.get<KPIsResponse>(path);
    return data;
  }
  await new Promise((r) => setTimeout(r, 200));
  return generateMockDashboardData().kpis;
}

/**
 * Fetch bottlenecks only (for alert widgets / notifications).
 */
export async function fetchBottlenecks(filters: DashboardFilters = {}): Promise<Bottleneck[]> {
  if (!isMockMode()) {
    const qs = filtersToParams(filters).toString();
    const path = `/api/manager/dashboard/bottlenecks${qs ? `?${qs}` : ''}`;
    const { data } = await platformApi.get<BottleneckDTO[]>(path);
    return data;
  }
  await new Promise((r) => setTimeout(r, 200));
  return generateMockDashboardData().bottlenecks;
}

/**
 * Fetch weekly trend data (for chart).
 */
export async function fetchWeeklyTrend(
  filters: DashboardFilters = {},
  weeks = 1,
): Promise<WeeklyTrend[]> {
  if (!isMockMode()) {
    const params = filtersToParams(filters);
    params.set('weeks', String(weeks));
    const path = `/api/manager/dashboard/weekly-trend?${params.toString()}`;
    const { data } = await platformApi.get<WeeklyTrendDTO[]>(path);
    return data;
  }
  await new Promise((r) => setTimeout(r, 200));
  return generateMockDashboardData().weeklyTrend;
}
