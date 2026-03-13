import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Clock, FileCheck, Heart, Stethoscope, Users, Zap,
  TrendingUp, FlaskConical, CalendarClock, ShieldAlert,
} from 'lucide-react';
import { riskLevelConfig, RiskLevel } from '@/domain/enums/risk-level';
import {
  fetchDashboardData,
  type DashboardData,
  type Bottleneck,
} from '@/services/dashboard-service';
import type { DashboardFilters } from '@/domain/contracts/platform-backend';

// ─── KPI Card ───

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentClass,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { direction: 'up' | 'down'; label: string; positive: boolean };
  accentClass?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`rounded-lg p-2 ${accentClass ?? 'bg-accent'}`}>
            <Icon className="h-4 w-4 text-accent-foreground" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trend.direction === 'up' ? (
              <ArrowUpRight className={`h-3 w-3 ${trend.positive ? 'text-primary' : 'text-destructive'}`} />
            ) : (
              <ArrowDownRight className={`h-3 w-3 ${trend.positive ? 'text-primary' : 'text-destructive'}`} />
            )}
            <span className={trend.positive ? 'text-primary' : 'text-destructive'}>{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Bottleneck item ───

function BottleneckItem({ bottleneck }: { bottleneck: Bottleneck }) {
  const severityMap = {
    critical: { icon: ShieldAlert, badgeVariant: 'destructive' as const, badgeLabel: 'Crítico' },
    warning: { icon: AlertTriangle, badgeVariant: 'secondary' as const, badgeLabel: 'Atenção' },
    info: { icon: Activity, badgeVariant: 'outline' as const, badgeLabel: 'Info' },
  };
  const cfg = severityMap[bottleneck.severity];
  const Icon = cfg.icon;

  return (
    <div className="flex gap-3 rounded-lg border bg-card p-4">
      <div className={`mt-0.5 shrink-0 rounded-md p-1.5 ${
        bottleneck.severity === 'critical' ? 'bg-destructive/10' :
        bottleneck.severity === 'warning' ? 'bg-secondary/10' : 'bg-accent'
      }`}>
        <Icon className={`h-4 w-4 ${
          bottleneck.severity === 'critical' ? 'text-destructive' :
          bottleneck.severity === 'warning' ? 'text-secondary' : 'text-accent-foreground'
        }`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{bottleneck.title}</p>
          <Badge variant={cfg.badgeVariant} className="text-[10px] px-1.5 py-0">{cfg.badgeLabel}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{bottleneck.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="font-medium">{bottleneck.metric}</span>
          <span className="text-muted-foreground">{bottleneck.threshold}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Chart configs ───

const weeklyChartConfig: ChartConfig = {
  intakes: { label: 'Acolhimentos', color: 'hsl(var(--secondary))' },
  resolved: { label: 'Resolvidos', color: 'hsl(var(--primary))' },
  referred: { label: 'Encaminhados', color: 'hsl(var(--muted-foreground))' },
};

const RISK_COLORS: Record<RiskLevel, string> = {
  [RiskLevel.EMERGENCY]: '#DC2626',
  [RiskLevel.VERY_URGENT]: '#EA580C',
  [RiskLevel.URGENT]: '#CA8A04',
  [RiskLevel.LESS_URGENT]: '#16A34A',
  [RiskLevel.NON_URGENT]: '#2563EB',
};

// ─── Main Dashboard ───

export default function ClinicalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData()
      .then((d) => {
        setData(d);
      })
      .catch((err) => {
        console.error('[ClinicalDashboard] Failed to load:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <AppShell role={UserRole.MANAGER}>
        <div className="flex items-center justify-center py-20">
          <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const { kpis, specialtyMetrics, journeyBreakdown, riskDistribution, bottlenecks, weeklyTrend, resolutionSplit } = data;

  const pieData = riskDistribution.map((r) => ({
    name: riskLevelConfig[r.level].label,
    value: r.count,
    color: RISK_COLORS[r.level],
  }));

  const riskChartConfig: ChartConfig = Object.fromEntries(
    riskDistribution.map((r) => [
      riskLevelConfig[r.level].label,
      { label: riskLevelConfig[r.level].label, color: RISK_COLORS[r.level] },
    ]),
  );

  return (
    <AppShell role={UserRole.MANAGER}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard Clínico</h1>
          <p className="text-sm text-muted-foreground">
            Métricas de fluxo, resolutividade e inteligência operacional
          </p>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <KpiCard
            title="Jornadas Ativas"
            value={kpis.totalActiveJourneys}
            icon={Users}
            subtitle={`${kpis.intakesToday} acolhimentos hoje`}
            trend={{ direction: 'up', label: '+12% sem.', positive: false }}
          />
          <KpiCard
            title="Resolução Primária"
            value={`${kpis.resolvedAtPrimaryRate}%`}
            icon={Heart}
            subtitle="Resolvidos na UBS"
            trend={{ direction: 'up', label: '+3% sem.', positive: true }}
            accentClass="bg-primary/10"
          />
          <KpiCard
            title="Tempo Médio Resolução"
            value={`${kpis.avgTimeToResolutionDays}d`}
            icon={Clock}
            subtitle="Intake → resolução"
            trend={{ direction: 'down', label: '-0.5d sem.', positive: true }}
          />
          <KpiCard
            title="Revisões Pendentes"
            value={kpis.pendingClinicalReviews}
            icon={FileCheck}
            subtitle="Pacotes aguardando médico"
            trend={{ direction: 'up', label: '+4 hoje', positive: false }}
            accentClass="bg-destructive/10"
          />
          <KpiCard
            title="Exames Pendentes"
            value={kpis.pendingExams}
            icon={FlaskConical}
            subtitle={`Turnaround: ~2.8d`}
          />
        </div>

        {/* ── Row 2: Charts ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Weekly trend */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Fluxo Semanal</CardTitle>
              <CardDescription>Acolhimentos, resoluções e encaminhamentos por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={weeklyChartConfig} className="h-[260px] w-full">
                <BarChart data={weeklyTrend} barGap={2}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="intakes" fill="var(--color-intakes)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" fill="var(--color-resolved)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="referred" fill="var(--color-referred)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Risk distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Distribuição de Risco</CardTitle>
              <CardDescription>Classificação Manchester ativa</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={riskChartConfig} className="h-[180px] w-full">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1 text-[10px]">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 3: Resolution split + Journey breakdown ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Resolution: Primary vs Referred */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Resolutividade
              </CardTitle>
              <CardDescription>UBS vs Encaminhamento externo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Resolvidos na UBS</span>
                  <span className="font-display font-bold text-primary">{resolutionSplit.resolvedPrimary}%</span>
                </div>
                <Progress value={resolutionSplit.resolvedPrimary} className="h-3" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Encaminhados</span>
                  <span className="font-display font-bold text-secondary">{resolutionSplit.referredOut}%</span>
                </div>
                <Progress value={resolutionSplit.referredOut} className="h-3" />
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-display text-lg font-bold">{kpis.awaitingSpecialist}</p>
                  <p className="text-[10px] text-muted-foreground">Aguardam especialista</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{kpis.activeProfessionals}</p>
                  <p className="text-[10px] text-muted-foreground">Profissionais ativos</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{kpis.throughputPerHour}</p>
                  <p className="text-[10px] text-muted-foreground">Atend./hora</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journey status breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-secondary" />
                Status das Jornadas
              </CardTitle>
              <CardDescription>Distribuição por etapa do cuidado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {journeyBreakdown.map((item) => {
                  const pct = Math.round((item.count / kpis.totalActiveJourneys) * 100);
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate text-xs">{item.label}</span>
                        <span className="ml-2 shrink-0 text-xs font-medium tabular-nums">{item.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-secondary/70 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 4: Bottlenecks + Specialty table ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Bottlenecks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Zap className="h-4 w-4 text-destructive" />
                Gargalos Operacionais
              </CardTitle>
              <CardDescription>Pontos de atenção no fluxo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bottlenecks.map((b) => (
                <BottleneckItem key={b.id} bottleneck={b} />
              ))}
            </CardContent>
          </Card>

          {/* Top specialties */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                Encaminhamentos por Especialidade
              </CardTitle>
              <CardDescription>Volume e tempo de espera</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="grid grid-cols-4 text-[10px] font-medium text-muted-foreground px-2 pb-1">
                  <span className="col-span-1">Especialidade</span>
                  <span className="text-center">Encam.</span>
                  <span className="text-center">Pend.</span>
                  <span className="text-right">Espera</span>
                </div>
                {specialtyMetrics.map((s) => (
                  <div
                    key={s.specialty}
                    className="grid grid-cols-4 items-center rounded-md px-2 py-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <span className="col-span-1 truncate text-xs font-medium">{s.specialty}</span>
                    <span className="text-center text-xs tabular-nums">{s.referralCount}</span>
                    <span className="text-center text-xs tabular-nums">{s.pendingCount}</span>
                    <span className="text-right text-xs tabular-nums text-muted-foreground">{s.avgWaitDays}d</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
