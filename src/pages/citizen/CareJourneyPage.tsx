import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  FlaskConical,
  Stethoscope,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { JourneyTimeline } from '@/features/journey/JourneyTimeline';
import { RiskBadge } from '@/features/shared/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/domain/enums/user-role';
import { CareJourneyStatus, careJourneyStatusConfig } from '@/domain/enums/care-journey-status';
import { CareStepStatus } from '@/domain/enums/care-step-status';
import type { CareJourney } from '@/domain/types/care-journey';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import { getCitizenJourneys, getIntakeForJourney } from '@/services/journey-service';
import { cn } from '@/lib/utils';

const STATUS_BANNER: Record<string, { icon: typeof Clock; title: string; subtitle: string; className: string }> = {
  [CareJourneyStatus.EXAMS_PENDING]: {
    icon: FlaskConical,
    title: 'Exames pendentes',
    subtitle: 'Realize os exames solicitados para dar continuidade ao seu atendimento.',
    className: 'border-secondary/30 bg-secondary/5',
  },
  [CareJourneyStatus.REFERRAL_PENDING]: {
    icon: Clock,
    title: 'Aguardando avaliação médica',
    subtitle: 'Um profissional de saúde está revisando seu caso e os resultados dos exames.',
    className: 'border-primary/30 bg-primary/5',
  },
  [CareJourneyStatus.AWAITING_SPECIALIST]: {
    icon: Stethoscope,
    title: 'Aguardando especialista',
    subtitle: 'Seu caso está na fila de regulação para atendimento com especialista.',
    className: 'border-secondary/30 bg-secondary/5',
  },
  [CareJourneyStatus.RESOLVED]: {
    icon: CheckCircle2,
    title: 'Caso resolvido',
    subtitle: 'Seu atendimento foi concluído. Cuide-se!',
    className: 'border-primary/30 bg-primary/5',
  },
};

const DEFAULT_BANNER = {
  icon: Activity,
  title: 'Jornada em andamento',
  subtitle: 'Seu atendimento está sendo acompanhado pela equipe de saúde.',
  className: 'border-border bg-muted/30',
};

function getNextAction(journey: CareJourney): { label: string; description: string } | null {
  const currentStep = journey.steps[journey.currentStepIndex];
  if (!currentStep) return null;
  switch (currentStep.type) {
    case 'EXAM_REQUEST':
      return { label: 'Realizar exames', description: 'Dirija-se ao laboratório ou setor de imagem da unidade para realizar os exames solicitados.' };
    case 'REFERRAL_DECISION':
      return { label: 'Aguardar avaliação', description: 'A equipe médica está avaliando seu caso. Você será notificado sobre o próximo passo.' };
    case 'REGULATION_QUEUE':
      return { label: 'Aguardar agendamento', description: `Seu caso está na regulação. Tempo estimado: ${journey.estimatedWaitDays ?? '—'} dias.` };
    case 'ATTENDANCE':
      return { label: 'Comparecer à consulta', description: 'Sua consulta está agendada. Leve seus documentos e exames.' };
    case 'FOLLOW_UP':
      return { label: 'Agendar retorno', description: 'Procure a recepção da UBS para agendar seu retorno.' };
    default:
      return null;
  }
}

export default function CareJourneyPage() {
  const navigate = useNavigate();
  const [journeys, setJourneys] = useState<CareJourney[]>([]);
  const [intake, setIntake] = useState<ClinicalIntake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCitizenJourneys('c-current');
        setJourneys(data);
        if (data.length > 0) {
          const intakeData = await getIntakeForJourney(data[0].intakeId);
          setIntake(intakeData);
        }
      } catch (err) {
        console.error('[CareJourneyPage] Failed to load journeys:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar jornada.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <AppShell role={UserRole.CITIZEN}>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell role={UserRole.CITIZEN}>
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Erro ao carregar jornada</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-6">
            Tentar novamente
          </Button>
        </div>
      </AppShell>
    );
  }

  if (journeys.length === 0) {
    return (
      <AppShell role={UserRole.CITIZEN}>
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Nenhuma jornada ativa</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inicie um atendimento clínico para acompanhar sua jornada de cuidado.
          </p>
          <Button onClick={() => navigate('/intake')} className="mt-6">
            Iniciar Atendimento
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </AppShell>
    );
  }

  const journey = journeys[0];
  const banner = STATUS_BANNER[journey.status] || DEFAULT_BANNER;
  const BannerIcon = banner.icon;
  const nextAction = getNextAction(journey);
  const statusLabel = careJourneyStatusConfig[journey.status]?.label ?? journey.status;
  const completedSteps = journey.steps.filter((s) => s.status === CareStepStatus.COMPLETED).length;

  return (
    <AppShell role={UserRole.CITIZEN}>
      <div className="mx-auto max-w-lg px-4 py-4 space-y-4">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Minha Jornada</h1>
          <p className="text-sm text-muted-foreground">Acompanhe seu caminho de cuidado</p>
        </div>

        {/* Status banner */}
        <div className={cn('rounded-xl border-2 p-4', banner.className)}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card">
              <BannerIcon className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-foreground">{banner.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{banner.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <RiskBadge level={journey.riskLevel} size="sm" />
            <Badge variant="outline" className="text-xs">{statusLabel}</Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {completedSteps}/{journey.steps.length} etapas
          </span>
        </div>

        {/* Chief complaint */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Queixa principal</p>
            <p className="mt-1 text-sm font-medium text-foreground">{journey.chiefComplaint}</p>
            {journey.targetSpecialty && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Stethoscope className="h-3.5 w-3.5" />
                Especialidade: <span className="font-medium text-foreground">{journey.targetSpecialty}</span>
              </div>
            )}
            {journey.estimatedWaitDays != null && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Tempo estimado: <span className="font-medium text-foreground">{journey.estimatedWaitDays} dias</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Action */}
        {nextAction && (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">Próximo passo</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{nextAction.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{nextAction.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm">Etapas do Cuidado</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <JourneyTimeline steps={journey.steps} currentStepIndex={journey.currentStepIndex} />
          </CardContent>
        </Card>

        {/* Collapsible clinical summary */}
        {intake?.clinicalSummary && (
          <Card>
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Resumo Clínico</span>
              </div>
              {showSummary ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {showSummary && (
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <Separator />
                <p className="text-sm leading-relaxed text-muted-foreground">{intake.clinicalSummary.narrative}</p>
                {intake.clinicalSummary.structuredFindings.length > 0 && (
                  <ul className="space-y-1">
                    {intake.clinicalSummary.structuredFindings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {intake.examSuggestions && intake.examSuggestions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <FlaskConical className="mr-1 inline-block h-3.5 w-3.5" />
                        Exames sugeridos
                      </p>
                      <div className="space-y-1">
                        {intake.examSuggestions.map((ex) => (
                          <div key={ex.id} className="flex items-center gap-2 text-xs text-foreground">
                            <span className={cn('h-1.5 w-1.5 rounded-full', ex.priority === 'URGENT' ? 'bg-destructive' : 'bg-muted-foreground')} />
                            {ex.examName}
                            {ex.priority === 'URGENT' && <Badge variant="destructive" className="text-[9px] px-1 py-0">Urgente</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Other journeys */}
        {journeys.length > 1 && (
          <Card>
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm">Outras jornadas ativas</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {journeys.slice(1).map((j) => (
                <div key={j.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{j.chiefComplaint}</p>
                    <p className="text-xs text-muted-foreground">{careJourneyStatusConfig[j.status]?.label}</p>
                  </div>
                  <RiskBadge level={j.riskLevel} size="sm" showLabel={false} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
