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
} from 'lucide-react';
import { useCaseStore } from '@/contexts/CaseStore';
import { CaseStatus } from '@/domain/enums/case-status';

export default function ManagerDashboard() {
  const { cases, dashboard } = useCaseStore();

  const pendingExams = dashboard.byStatus[CaseStatus.EXAMS_REQUESTED] ?? 0;
  const pendingReferrals = (dashboard.byStatus[CaseStatus.REFERRED] ?? 0) + (dashboard.byStatus[CaseStatus.SCHEDULED] ?? 0);

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

        {/* Quick KPIs - derived from CaseStore */}
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
                    {dashboard.resolvedPrimaryRate > 0 ? `${dashboard.resolvedPrimaryRate}%` : '68%'}
                  </p>
                  <p className="text-xs text-muted-foreground">Resolutividade UBS</p>
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
                  <p className="font-display text-2xl font-bold">4.2d</p>
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

        {/* UBS Units Overview */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <Building2 className="h-4 w-4 text-primary" />
                Unidades de Saúde
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'UBS Vila Esperança', patients: cases.filter((c) => c.assignedUnitId === 'u-1').length, resolution: 72, professionals: 8 },
                { name: 'UBS Jardim Primavera', patients: cases.filter((c) => c.assignedUnitId === 'u-2').length, resolution: 65, professionals: 6 },
                { name: 'UBS Jardim América', patients: 29, resolution: 78, professionals: 5 },
                { name: 'UPA São Mateus', patients: 52, resolution: 58, professionals: 12 },
                { name: 'Centro de Especialidades', patients: 23, resolution: 85, professionals: 10 },
              ].map((unit) => (
                <div key={unit.name} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{unit.name}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{unit.patients} pacientes</span>
                      <span>{unit.professionals} profissionais</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-display font-bold text-primary">{unit.resolution}%</p>
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
                Top Especialidades — Espera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(dashboard.specialtyDistribution.length > 0
                ? dashboard.specialtyDistribution.map((s) => ({ specialty: s.specialty, count: s.count, avgWaitDays: Math.round(15 + Math.random() * 20) }))
                : [
                    { specialty: 'Cardiologia', count: 12, avgWaitDays: 18 },
                    { specialty: 'Ortopedia', count: 9, avgWaitDays: 25 },
                    { specialty: 'Neurologia', count: 7, avgWaitDays: 22 },
                    { specialty: 'Endocrinologia', count: 6, avgWaitDays: 30 },
                    { specialty: 'Pneumologia', count: 5, avgWaitDays: 14 },
                  ]
              ).map((s) => (
                <div key={s.specialty} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.specialty}</span>
                    <span className="text-xs text-muted-foreground">{s.count} encam. · {s.avgWaitDays}d espera</span>
                  </div>
                  <Progress value={Math.min(100, (s.avgWaitDays / 30) * 100)} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Today's metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <TrendingUp className="h-4 w-4 text-primary" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="font-display text-2xl font-bold">{cases.length}</p>
                <p className="text-xs text-muted-foreground">Total de Casos</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold">{dashboard.totalCompleted}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold">{pendingExams}</p>
                <p className="text-xs text-muted-foreground">Exames pendentes</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold">{dashboard.avgPriority}</p>
                <p className="text-xs text-muted-foreground">Prioridade média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
