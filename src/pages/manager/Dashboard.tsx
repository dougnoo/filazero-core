import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, Activity, BarChart3, ArrowRight,
  Users, Heart, Clock, FileCheck, Stethoscope,
  Building2, TrendingUp, AlertTriangle, ClipboardList,
  ShieldAlert,
} from 'lucide-react';
import { useCaseStore } from '@/contexts/CaseStore';
import { CaseStatus, caseStatusConfig } from '@/domain/enums/case-status';
import { RiskLevel, riskLevelConfig } from '@/domain/enums/risk-level';

export default function ManagerDashboard() {
  const { cases, dashboard } = useCaseStore();

  // ─── Derived metrics (all from CaseStore) ───

  const metrics = useMemo(() => {
    // APS resolution rate
    const completedCases = cases.filter((c) => c.status === CaseStatus.COMPLETED);
    const resolvedPrimary = completedCases.filter((c) => c.referralDecision === 'RESOLVE_PRIMARY').length;
    const apsResolutionRate = completedCases.length > 0
      ? Math.round((resolvedPrimary / completedCases.length) * 100)
      : 0;

    // Avg resolution time (days)
    const resolvedWithDates = completedCases.filter((c) => c.resolvedAt && c.createdAt);
    const avgResolutionDays = resolvedWithDates.length > 0
      ? (resolvedWithDates.reduce((sum, c) => {
          const created = new Date(c.createdAt).getTime();
          const resolved = new Date(c.resolvedAt!).getTime();
          return sum + (resolved - created) / 86400000;
        }, 0) / resolvedWithDates.length).toFixed(1)
      : '—';

    // Cases by unit
    const unitMap = new Map<string, { name: string; count: number; completed: number }>();
    cases.forEach((c) => {
      const entry = unitMap.get(c.assignedUnitId) ?? { name: c.assignedUnitName, count: 0, completed: 0 };
      entry.count++;
      if (c.status === CaseStatus.COMPLETED) entry.completed++;
      unitMap.set(c.assignedUnitId, entry);
    });
    const unitStats = [...unitMap.values()].map((u) => ({
      ...u,
      resolutionRate: u.count > 0 ? Math.round((u.completed / u.count) * 100) : 0,
    }));

    // Specialty bottlenecks with estimated wait (derived from non-completed cases)
    const specialtyWait = new Map<string, { count: number; totalDays: number }>();
    cases.forEach((c) => {
      if (c.suggestedDestination && c.status !== CaseStatus.COMPLETED && c.status !== CaseStatus.CANCELLED) {
        const entry = specialtyWait.get(c.suggestedDestination) ?? { count: 0, totalDays: 0 };
        entry.count++;
        const daysOpen = (Date.now() - new Date(c.createdAt).getTime()) / 86400000;
        entry.totalDays += daysOpen;
        specialtyWait.set(c.suggestedDestination, entry);
      }
    });
    const specialtyBottlenecks = [...specialtyWait.entries()]
      .map(([specialty, data]) => ({
        specialty,
        count: data.count,
        avgWaitDays: Math.round(data.totalDays / data.count),
      }))
      .sort((a, b) => b.count - a.count);

    // Status distribution for active cases
    const statusDistribution = Object.entries(dashboard.byStatus)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        status: status as CaseStatus,
        count,
        label: caseStatusConfig[status as CaseStatus]?.label ?? status,
      }))
      .sort((a, b) => b.count - a.count);

    // Risk distribution
    const riskDistribution = Object.entries(dashboard.byRisk)
      .filter(([_, count]) => count > 0)
      .map(([risk, count]) => ({
        risk: risk as RiskLevel,
        count,
        label: riskLevelConfig[risk as RiskLevel]?.label ?? risk,
        color: riskLevelConfig[risk as RiskLevel]?.color ?? '#888',
      }))
      .sort((a, b) => (riskLevelConfig[a.risk]?.order ?? 5) - (riskLevelConfig[b.risk]?.order ?? 5));

    return {
      apsResolutionRate,
      avgResolutionDays,
      unitStats,
      specialtyBottlenecks,
      statusDistribution,
      riskDistribution,
    };
  }, [cases, dashboard]);

  return (
    <AppShell role={UserRole.MANAGER}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Painel do Gestor</h1>
            <p className="text-sm text-muted-foreground">
              Prefeitura de São Paulo — Secretaria Municipal de Saúde
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/casos">
              <Button variant="outline" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                Casos
              </Button>
            </Link>
            <Link to="/dashboard-clinico">
              <Button variant="outline" className="gap-2">
                <Activity className="h-4 w-4" />
                Dashboard Clínico
              </Button>
            </Link>
            <Link to="/fluxo">
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Fluxo
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick KPIs - ALL derived from CaseStore */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">{dashboard.totalActive}</p>
                  <p className="text-xs text-muted-foreground">Jornadas ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent p-2">
                  <Heart className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">
                    {metrics.apsResolutionRate > 0 ? `${metrics.apsResolutionRate}%` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">Resolutividade APS</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary/10 p-2">
                  <Clock className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">{metrics.avgResolutionDays}d</p>
                  <p className="text-xs text-muted-foreground">Tempo médio resolução</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">{dashboard.pendingReviews}</p>
                  <p className="text-xs text-muted-foreground">Revisões pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution + Status Distribution */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Casos por Risco (Manchester)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.riskDistribution.map((r) => (
                <div key={r.risk} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="font-medium">{r.label}</span>
                    </div>
                    <span className="font-display font-bold">{r.count}</span>
                  </div>
                  <Progress value={cases.length > 0 ? (r.count / cases.length) * 100 : 0} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <ClipboardList className="h-4 w-4 text-primary" />
                Fila por Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {metrics.statusDistribution.map((s) => (
                <div key={s.status} className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Badge variant={caseStatusConfig[s.status]?.variant ?? 'outline'} className="text-[10px]">
                      {s.label}
                    </Badge>
                  </div>
                  <span className="font-display font-bold text-sm">{s.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Units + Specialty Bottlenecks */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <Building2 className="h-4 w-4 text-primary" />
                Unidades de Saúde
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.unitStats.map((unit) => (
                <div key={unit.name} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{unit.name}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{unit.count} casos</span>
                      <span>{unit.completed} concluídos</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-display font-bold text-primary">{unit.resolutionRate}%</p>
                    <p className="text-[10px] text-muted-foreground">resolução</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <Stethoscope className="h-4 w-4 text-secondary" />
                Gargalos por Especialidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.specialtyBottlenecks.length > 0 ? (
                metrics.specialtyBottlenecks.map((s) => (
                  <div key={s.specialty} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.specialty}</span>
                      <span className="text-xs text-muted-foreground">{s.count} casos · ~{s.avgWaitDays}d espera</span>
                    </div>
                    <Progress value={Math.min(100, (s.avgWaitDays / 30) * 100)} className="h-1.5" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum gargalo identificado</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <TrendingUp className="h-4 w-4 text-primary" />
              Resumo Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="text-center">
                <p className="font-display text-2xl font-bold">{cases.length}</p>
                <p className="text-xs text-muted-foreground">Total de Casos</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold">{dashboard.totalCompleted}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold">{dashboard.byStatus[CaseStatus.EXAMS_REQUESTED] ?? 0}</p>
                <p className="text-xs text-muted-foreground">Exames pendentes</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold">{dashboard.avgPriority}</p>
                <p className="text-xs text-muted-foreground">Prioridade média</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold">{dashboard.referralRate > 0 ? `${dashboard.referralRate}%` : '—'}</p>
                <p className="text-xs text-muted-foreground">Taxa encaminhamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
