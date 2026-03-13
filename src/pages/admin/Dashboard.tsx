import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Building2, Users, Stethoscope, Activity,
  MapPin, CheckCircle2, AlertTriangle, TrendingUp,
  Plus, Settings, Eye, BarChart3,
} from 'lucide-react';

// Mock tenant (prefeitura) data
const mockPrefeituras = [
  {
    id: 'pref-001',
    name: 'Prefeitura de São Paulo',
    state: 'SP',
    units: 12,
    professionals: 86,
    activeJourneys: 1420,
    resolutionRate: 68,
    status: 'active' as const,
    plan: 'Enterprise',
    monthlyIntakes: 3200,
  },
  {
    id: 'pref-002',
    name: 'Prefeitura de Campinas',
    state: 'SP',
    units: 6,
    professionals: 42,
    activeJourneys: 580,
    resolutionRate: 72,
    status: 'active' as const,
    plan: 'Pro',
    monthlyIntakes: 1100,
  },
  {
    id: 'pref-003',
    name: 'Prefeitura de Recife',
    state: 'PE',
    units: 8,
    professionals: 54,
    activeJourneys: 890,
    resolutionRate: 61,
    status: 'active' as const,
    plan: 'Enterprise',
    monthlyIntakes: 1800,
  },
  {
    id: 'pref-004',
    name: 'Prefeitura de Belo Horizonte',
    state: 'MG',
    units: 10,
    professionals: 68,
    activeJourneys: 1050,
    resolutionRate: 70,
    status: 'active' as const,
    plan: 'Enterprise',
    monthlyIntakes: 2400,
  },
  {
    id: 'pref-005',
    name: 'Prefeitura de Florianópolis',
    state: 'SC',
    units: 4,
    professionals: 28,
    activeJourneys: 320,
    resolutionRate: 75,
    status: 'trial' as const,
    plan: 'Starter',
    monthlyIntakes: 600,
  },
  {
    id: 'pref-006',
    name: 'Prefeitura de Manaus',
    state: 'AM',
    units: 7,
    professionals: 38,
    activeJourneys: 0,
    resolutionRate: 0,
    status: 'onboarding' as const,
    plan: 'Pro',
    monthlyIntakes: 0,
  },
];

const platformStats = {
  totalPrefeituras: mockPrefeituras.length,
  activePrefeituras: mockPrefeituras.filter((p) => p.status === 'active').length,
  totalUnits: mockPrefeituras.reduce((s, p) => s + p.units, 0),
  totalProfessionals: mockPrefeituras.reduce((s, p) => s + p.professionals, 0),
  totalActiveJourneys: mockPrefeituras.reduce((s, p) => s + p.activeJourneys, 0),
  avgResolutionRate: Math.round(
    mockPrefeituras.filter((p) => p.resolutionRate > 0).reduce((s, p) => s + p.resolutionRate, 0) /
    mockPrefeituras.filter((p) => p.resolutionRate > 0).length
  ),
  totalMonthlyIntakes: mockPrefeituras.reduce((s, p) => s + p.monthlyIntakes, 0),
};

type StatusFilter = 'all' | 'active' | 'trial' | 'onboarding';

export default function AdminDashboard() {
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filtered = filter === 'all'
    ? mockPrefeituras
    : mockPrefeituras.filter((p) => p.status === filter);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-primary/10 text-primary border-0 text-[10px]">Ativo</Badge>;
      case 'trial': return <Badge className="bg-secondary/10 text-secondary border-0 text-[10px]">Trial</Badge>;
      case 'onboarding': return <Badge variant="outline" className="text-[10px]">Onboarding</Badge>;
      default: return null;
    }
  };

  return (
    <AppShell role={UserRole.ADMIN}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Admin — Plataforma FilaZero</h1>
            <p className="text-sm text-muted-foreground">
              Gestão SaaS de prefeituras e secretarias de saúde
            </p>
          </div>
          <Button className="gap-2 font-display">
            <Plus className="h-4 w-4" />
            Nova Prefeitura
          </Button>
        </div>

        {/* Platform KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{platformStats.totalPrefeituras}</p>
                <p className="text-xs text-muted-foreground">Prefeituras</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-secondary/10 p-2">
                <Building2 className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{platformStats.totalUnits}</p>
                <p className="text-xs text-muted-foreground">Unidades de Saúde</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-accent p-2">
                <Users className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{platformStats.totalProfessionals}</p>
                <p className="text-xs text-muted-foreground">Profissionais</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{platformStats.avgResolutionRate}%</p>
                <p className="text-xs text-muted-foreground">Resolução média</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform-wide metrics */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-display text-3xl font-bold text-primary">
                  {platformStats.totalActiveJourneys.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Jornadas ativas na plataforma</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-secondary">
                  {platformStats.totalMonthlyIntakes.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Intakes/mês</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold">{platformStats.activePrefeituras}</p>
                <p className="text-xs text-muted-foreground">Prefeituras ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prefeitura list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Prefeituras</h2>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="active">Ativas</TabsTrigger>
                <TabsTrigger value="trial">Trial</TabsTrigger>
                <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            {filtered.map((pref) => (
              <Card key={pref.id} className="group hover:shadow-md transition-all hover:border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-semibold truncate">{pref.name}</p>
                        {statusBadge(pref.status)}
                        <Badge variant="outline" className="text-[10px]">{pref.plan}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {pref.units} UBS
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {pref.professionals} profissionais
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {pref.activeJourneys} jornadas
                        </span>
                        {pref.resolutionRate > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {pref.resolutionRate}% resolução
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
