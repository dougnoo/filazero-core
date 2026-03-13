import { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { RiskBadge } from '@/features/shared/RiskBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ListChecks, Clock, Users, FileCheck, ArrowRight,
  Stethoscope, AlertTriangle, CheckCircle2, Loader2,
  Activity, ChevronRight,
} from 'lucide-react';
import { services } from '@/services/adapters';
import type { ClinicalPackage } from '@/services/clinical-review-service';
import { mockQueuePositions } from '@/mock';
import { CareJourneyStatus, careJourneyStatusConfig } from '@/domain/enums/care-journey-status';
import { CaseDetail } from '@/features/clinical-review/CaseDetail';
import { CaseList } from '@/features/clinical-review/CaseList';

type ViewMode = 'queue' | 'review';
type TabFilter = 'pending' | 'in_progress' | 'completed';

export default function ProfessionalDashboard() {
  const [tab, setTab] = useState<TabFilter>('pending');
  const [viewMode, setViewMode] = useState<ViewMode>('queue');
  const [allPackages, setAllPackages] = useState<ClinicalPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<ClinicalPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set());
  const [validationResults, setValidationResults] = useState<Record<string, { action: string; newStatus: CareJourneyStatus }>>({});

  const waitingPatients = mockQueuePositions.filter((p) => p.status === 'WAITING');

  useEffect(() => {
    getAllClinicalPackages()
      .then(setAllPackages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter packages based on tab + exclude validated ones
  const filteredPackages = allPackages.filter((pkg) => {
    const jid = pkg.journey.id;
    const effectiveStatus = validationResults[jid]?.newStatus ?? pkg.journey.status;

    if (validatedIds.has(jid) && tab === 'pending') return false;

    switch (tab) {
      case 'pending':
        return [
          CareJourneyStatus.TRIAGE_COMPLETE,
          CareJourneyStatus.EXAMS_PENDING,
          CareJourneyStatus.EXAMS_COMPLETE,
          CareJourneyStatus.REFERRAL_PENDING,
        ].includes(effectiveStatus);
      case 'in_progress':
        return [
          CareJourneyStatus.AWAITING_SPECIALIST,
          CareJourneyStatus.IN_ATTENDANCE,
          CareJourneyStatus.REFERRAL_SCHEDULED,
        ].includes(effectiveStatus) || (validatedIds.has(jid) && effectiveStatus !== CareJourneyStatus.RESOLVED);
      case 'completed':
        return effectiveStatus === CareJourneyStatus.RESOLVED;
    }
  });

  const pendingCount = allPackages.filter((pkg) => {
    if (validatedIds.has(pkg.journey.id)) return false;
    return [
      CareJourneyStatus.TRIAGE_COMPLETE,
      CareJourneyStatus.EXAMS_PENDING,
      CareJourneyStatus.EXAMS_COMPLETE,
      CareJourneyStatus.REFERRAL_PENDING,
    ].includes(pkg.journey.status);
  }).length;

  const resolvedCount = allPackages.filter((pkg) =>
    (validationResults[pkg.journey.id]?.newStatus ?? pkg.journey.status) === CareJourneyStatus.RESOLVED
  ).length;

  const handleSelectCase = (pkg: ClinicalPackage) => {
    setSelectedPkg(pkg);
    setViewMode('review');
  };

  const handleValidationComplete = useCallback((journeyId: string, action: string, newStatus: CareJourneyStatus) => {
    setValidatedIds((prev) => new Set([...prev, journeyId]));
    setValidationResults((prev) => ({ ...prev, [journeyId]: { action, newStatus } }));
  }, []);

  const handleBackToQueue = () => {
    setViewMode('queue');
    setSelectedPkg(null);
  };

  if (loading) {
    return (
      <AppShell role={UserRole.PROFESSIONAL}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando fila de triagem...</span>
        </div>
      </AppShell>
    );
  }

  // ═══ Review Mode: split pane ═══
  if (viewMode === 'review' && selectedPkg) {
    return (
      <AppShell role={UserRole.PROFESSIONAL}>
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackToQueue} className="gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            Voltar à fila
          </Button>
          <h1 className="font-display text-xl font-bold">Revisão Clínica</h1>
        </div>

        <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border bg-card">
          <div className="w-80 shrink-0 border-r lg:w-96">
            <CaseList
              packages={filteredPackages}
              selectedId={selectedPkg.journey.id}
              onSelect={setSelectedPkg}
            />
          </div>
          <div className="flex-1">
            <CaseDetail
              pkg={selectedPkg}
              onValidationComplete={handleValidationComplete}
            />
          </div>
        </div>
      </AppShell>
    );
  }

  // ═══ Queue Mode: dashboard ═══
  return (
    <AppShell role={UserRole.PROFESSIONAL}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold">Fila de Triagem</h1>
          <p className="text-sm text-muted-foreground">UBS Centro — Dr. Carlos Mendes</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-destructive/10 p-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Aguardando revisão</p>
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
              <div className="rounded-lg bg-primary/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{validatedIds.size}</p>
                <p className="text-xs text-muted-foreground">Validados agora</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-muted p-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{resolvedCount}</p>
                <p className="text-xs text-muted-foreground">Resolvidos total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab filter */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabFilter)}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-1.5">
              <ListChecks className="h-3.5 w-3.5" />
              Pendentes ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" />
              Em andamento
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolvidos ({resolvedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Patient Cards */}
        <div className="space-y-2">
          {filteredPackages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
              <CheckCircle2 className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {tab === 'pending' ? 'Todos os pacotes foram revisados! 🎉' : 'Nenhum paciente neste status.'}
              </p>
            </div>
          ) : (
            filteredPackages.map((pkg) => {
              const { journey, intake } = pkg;
              const validation = validationResults[journey.id];
              const effectiveStatus = validation?.newStatus ?? journey.status;

              return (
                <Card
                  key={journey.id}
                  className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                  onClick={() => handleSelectCase(pkg)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <RiskBadge level={journey.riskLevel} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-semibold truncate">{journey.citizenName}</p>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {careJourneyStatusConfig[effectiveStatus]?.label ?? effectiveStatus}
                        </Badge>
                        {validation && (
                          <Badge className="text-[10px] shrink-0 bg-primary">
                            ✓ Validado
                          </Badge>
                        )}
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
                          <Activity className="h-3 w-3" />
                          Score: {journey.priorityScore}
                        </span>
                        {intake.examSuggestions && (
                          <span className="flex items-center gap-1">
                            <FileCheck className="h-3 w-3" />
                            {intake.examSuggestions.length} exames
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}