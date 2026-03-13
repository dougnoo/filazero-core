import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight, Building2, Stethoscope, Hospital,
  Users, TrendingUp, Clock, CheckCircle2, XCircle,
  ArrowDown, Zap,
} from 'lucide-react';

// Flow data: UBS → Especialista → Hospital
const flowData = {
  totalIntakes: 1420,
  resolvedPrimary: 965,
  referredSpecialist: 387,
  referredHospital: 68,
  resolvedPrimaryRate: 68,
  specialistResolutionRate: 82,
  hospitalRate: 4.8,
};

const flowStages = [
  {
    icon: Building2,
    label: 'UBS — Atenção Primária',
    count: flowData.totalIntakes,
    description: 'Acolhimentos com IA clínica',
    color: 'bg-primary/10 text-primary',
    metrics: [
      { label: 'Resolvidos na UBS', value: flowData.resolvedPrimary, pct: flowData.resolvedPrimaryRate },
      { label: 'Encaminhados', value: flowData.referredSpecialist + flowData.referredHospital, pct: 32 },
    ],
  },
  {
    icon: Stethoscope,
    label: 'Especialista',
    count: flowData.referredSpecialist,
    description: 'Consultas e procedimentos especializados',
    color: 'bg-secondary/10 text-secondary',
    metrics: [
      { label: 'Resolvidos', value: 317, pct: flowData.specialistResolutionRate },
      { label: 'Hospitalizados', value: flowData.referredHospital, pct: 18 },
    ],
  },
  {
    icon: Hospital,
    label: 'Hospital',
    count: flowData.referredHospital,
    description: 'Internações e emergências',
    color: 'bg-destructive/10 text-destructive',
    metrics: [
      { label: 'Alta', value: 52, pct: 76 },
      { label: 'Em internação', value: 16, pct: 24 },
    ],
  },
];

const bottlenecks = [
  { specialty: 'Ortopedia', waitDays: 45, pending: 34, trend: 'up' as const },
  { specialty: 'Endocrinologia', waitDays: 38, pending: 28, trend: 'up' as const },
  { specialty: 'Neurologia', waitDays: 32, pending: 22, trend: 'down' as const },
  { specialty: 'Cardiologia', waitDays: 18, pending: 15, trend: 'down' as const },
  { specialty: 'Pneumologia', waitDays: 14, pending: 12, trend: 'stable' as const },
];

export default function FlowAnalytics() {
  return (
    <AppShell role={UserRole.MANAGER}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Fluxo da Rede de Saúde</h1>
          <p className="text-sm text-muted-foreground">
            Visualização do fluxo de pacientes: UBS → Especialista → Hospital
          </p>
        </div>

        {/* Flow visualization */}
        <div className="grid gap-4 lg:grid-cols-3">
          {flowStages.map((stage, idx) => (
            <div key={stage.label} className="relative">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${stage.color}`}>
                      <stage.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-display">{stage.label}</CardTitle>
                      <CardDescription>{stage.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="font-display text-4xl font-bold">{stage.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">pacientes no período</p>
                  </div>
                  {stage.metrics.map((m) => (
                    <div key={m.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{m.label}</span>
                        <span className="font-display font-bold">{m.pct}%</span>
                      </div>
                      <Progress value={m.pct} className="h-2" />
                      <p className="text-[10px] text-muted-foreground">{m.value} pacientes</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              {idx < flowStages.length - 1 && (
                <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Regulation queue bottlenecks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <Zap className="h-4 w-4 text-destructive" />
                Fila de Regulação — Gargalos
              </CardTitle>
              <CardDescription>Especialidades com maior tempo de espera</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="grid grid-cols-4 text-[10px] font-medium text-muted-foreground px-2 pb-1">
                  <span>Especialidade</span>
                  <span className="text-center">Espera</span>
                  <span className="text-center">Pendentes</span>
                  <span className="text-right">Tendência</span>
                </div>
                {bottlenecks.map((b) => (
                  <div
                    key={b.specialty}
                    className="grid grid-cols-4 items-center rounded-md px-2 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xs font-medium">{b.specialty}</span>
                    <span className="text-center text-xs tabular-nums">
                      <Badge variant={b.waitDays > 30 ? 'destructive' : 'secondary'} className="text-[10px]">
                        {b.waitDays}d
                      </Badge>
                    </span>
                    <span className="text-center text-xs tabular-nums">{b.pending}</span>
                    <span className="text-right">
                      {b.trend === 'up' && <TrendingUp className="inline h-3.5 w-3.5 text-destructive" />}
                      {b.trend === 'down' && <ArrowDown className="inline h-3.5 w-3.5 text-primary" />}
                      {b.trend === 'stable' && <span className="text-xs text-muted-foreground">—</span>}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resolution metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <TrendingUp className="h-4 w-4 text-primary" />
                Indicadores de Resolutividade
              </CardTitle>
              <CardDescription>Métricas chave da rede</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Taxa de Resolução na APS', value: '68%', icon: CheckCircle2, color: 'text-primary', desc: 'Meta SUS: >70%' },
                { label: 'Taxa de Encaminhamento', value: '32%', icon: ArrowRight, color: 'text-secondary', desc: 'Meta: <30%' },
                { label: 'Taxa de Hospitalização', value: '4.8%', icon: Hospital, color: 'text-destructive', desc: 'Meta: <5%' },
                { label: 'Tempo Médio até Especialista', value: '22d', icon: Clock, color: 'text-muted-foreground', desc: 'Meta: <15d' },
                { label: 'Retorno sem Resolução', value: '8.2%', icon: XCircle, color: 'text-destructive', desc: 'Meta: <5%' },
                { label: 'Pacientes Regulados/mês', value: '455', icon: Users, color: 'text-primary', desc: '+12% vs anterior' },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center gap-3">
                  <metric.icon className={`h-4 w-4 shrink-0 ${metric.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{metric.label}</p>
                    <p className="text-[10px] text-muted-foreground">{metric.desc}</p>
                  </div>
                  <p className="font-display text-lg font-bold shrink-0">{metric.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
