import { RiskLevel } from '@/domain/enums/risk-level';
import { CareJourneyStatus } from '@/domain/enums/care-journey-status';
import { isMockMode } from '@/lib/env';
import { platformApi } from '@/lib/api-client';
// ─── Types for dashboard metrics ───

export interface DashboardKPIs {
  totalActiveJourneys: number;
  resolvedAtPrimaryRate: number;
  referralRate: number;
  avgTimeToResolutionDays: number;
  pendingClinicalReviews: number;
  pendingExams: number;
  awaitingSpecialist: number;
  intakesToday: number;
  avgIntakeDurationMinutes: number;
  activeProfessionals: number;
  throughputPerHour: number;
}

export interface SpecialtyMetric {
  specialty: string;
  referralCount: number;
  avgWaitDays: number;
  pendingCount: number;
}

export interface JourneyStatusBreakdown {
  status: CareJourneyStatus;
  label: string;
  count: number;
}

export interface RiskDistribution {
  level: RiskLevel;
  count: number;
}

export interface Bottleneck {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric: string;
  threshold: string;
}

export interface WeeklyTrend {
  day: string;
  intakes: number;
  resolved: number;
  referred: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  specialtyMetrics: SpecialtyMetric[];
  journeyBreakdown: JourneyStatusBreakdown[];
  riskDistribution: RiskDistribution[];
  bottlenecks: Bottleneck[];
  weeklyTrend: WeeklyTrend[];
  resolutionSplit: { resolvedPrimary: number; referredOut: number };
}

// ─── Mock data generation ───

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

// ─── Service abstraction (ready for backend replacement) ───

export async function fetchDashboardData(): Promise<DashboardData> {
  // Simulates API latency
  await new Promise((r) => setTimeout(r, 400));
  return generateMockDashboardData();
}
