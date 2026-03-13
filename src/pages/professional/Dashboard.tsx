import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { RiskBadge } from '@/features/shared/RiskBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ListChecks, Clock, Users, FileCheck, ArrowRight,
  Stethoscope, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { mockCareJourneys, mockQueuePositions } from '@/mock';
import { CareJourneyStatus, careJourneyStatusConfig } from '@/domain/enums/care-journey-status';
import { RiskLevel } from '@/domain/enums/risk-level';

type TabFilter = 'pending' | 'in_progress' | 'completed';

export default function ProfessionalDashboard() {
  const [tab, setTab] = useState<TabFilter>('pending');

  // Derive stats from mock data
  const pendingReviews = mockCareJourneys.filter(
    (j) => j.status !== CareJourneyStatus.RESOLVED && j.status !== CareJourneyStatus.CANCELLED
  );
  const completedToday = mockCareJourneys.filter((j) => j.status === CareJourneyStatus.RESOLVED);
  const waitingPatients = mockQueuePositions.filter((p) => p.status === 'WAITING');

  const filteredJourneys = tab === 'pending'
    ? mockCareJourneys.filter((j) =>
        [CareJourneyStatus.TRIAGE_COMPLETE, CareJourneyStatus.EXAMS_PENDING, CareJourneyStatus.REFERRAL_PENDING].includes(j.status)
      )
    : tab === 'in_progress'
    ? mockCareJourneys.filter((j) =>
        [CareJourneyStatus.EXAMS_COMPLETE, CareJourneyStatus.AWAITING_SPECIALIST, CareJourneyStatus.IN_ATTENDANCE].includes(j.status)
      )
    : mockCareJourneys.filter((j) => j.status === CareJourneyStatus.RESOLVED);

  return (
    <AppShell role={UserRole.PROFESSIONAL}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Painel do Profissional</h1>
            <p className="text-sm text-muted-foreground">UBS Centro — Dr. Carlos Mendes</p>
          </div>
          <Link to="/revisao-clinica">
            <Button className="gap-2 font-display">
              <FileCheck className="h-4 w-4" />
              Revisão Clínica
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-destructive/10 p-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{pendingReviews.length}</p>
                <p className="text-xs text-muted-foreground">Pendentes de revisão</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{waitingPatients.length}</p>
                <p className="text-xs text-muted-foreground">Na fila hoje</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-secondary/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{completedToday.length}</p>
                <p className="text-xs text-muted-foreground">Resolvidos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-accent p-2">
                <Clock className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">8min</p>
                <p className="text-xs text-muted-foreground">Tempo médio intake</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient list */}
        <div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabFilter)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="pending" className="gap-1.5">
                  <ListChecks className="h-3.5 w-3.5" />
                  Pendentes
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Em andamento
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Resolvidos
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          <div className="space-y-2">
            {filteredJourneys.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                <CheckCircle2 className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Nenhum paciente neste status</p>
              </div>
            ) : (
              filteredJourneys.map((journey) => (
                <Link key={journey.id} to="/revisao-clinica">
                  <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                    <CardContent className="flex items-center gap-4 p-4">
                      <RiskBadge level={journey.riskLevel} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-display font-semibold truncate">{journey.citizenName}</p>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {careJourneyStatusConfig[journey.status].label}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground truncate">
                          {journey.chiefComplaint}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          {journey.targetSpecialty && (
                            <span className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {journey.targetSpecialty}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Score: {journey.priorityScore}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
