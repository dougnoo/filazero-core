/**
 * Case Detail Page — /casos/:id
 *
 * Full view of a single case: patient summary, intake, risk, journey,
 * review status, exams, referral, and mutation actions.
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { useCaseStore } from '@/contexts/CaseStore';
import { LoadingState, EmptyState, ErrorState, UrgentBanner } from '@/components/shared/DataState';
import { RiskBadge } from '@/features/shared/RiskBadge';
import { JourneyTimeline } from '@/features/journey/JourneyTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { caseStatusConfig, CaseStatus } from '@/domain/enums/case-status';
import { RiskLevel } from '@/domain/enums/risk-level';
import { mockCareJourneys } from '@/mock/clinical-data';
import {
  ArrowLeft, ArrowRight, User, FileText, FlaskConical,
  Stethoscope, CheckCircle2, Clock, Building2, AlertTriangle,
  ClipboardList, ShieldAlert, Activity,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCase, getIntakeForCase, mutate } = useCaseStore();

  const caseItem = id ? getCase(id) : undefined;

  if (!caseItem) {
    return (
      <AppShell role={UserRole.PROFESSIONAL}>
        <EmptyState
          icon={ClipboardList}
          title="Caso não encontrado"
          description={`O caso "${id}" não existe ou foi removido.`}
          action={{ label: 'Voltar aos casos', onClick: () => navigate('/casos') }}
        />
      </AppShell>
    );
  }

  const intake = getIntakeForCase(caseItem);
  const journey = mockCareJourneys.find((j) => j.id === caseItem.journeyId);
  const statusCfg = caseStatusConfig[caseItem.status];
  const isUrgent = caseItem.riskLevel === RiskLevel.EMERGENCY || caseItem.riskLevel === RiskLevel.VERY_URGENT;

  const handleApproveReview = () => {
    mutate({ type: 'APPROVE_REVIEW', caseId: caseItem.id, reviewedBy: 'Dr. Carlos Mendes' });
    toast.success('Revisão aprovada com sucesso.');
  };

  const handleRequestExams = () => {
    mutate({ type: 'REQUEST_EXAMS', caseId: caseItem.id });
    toast.success('Exames solicitados.');
  };

  const handleMarkReferred = () => {
    mutate({ type: 'MARK_REFERRED', caseId: caseItem.id, destination: caseItem.suggestedDestination ?? 'Especialista' });
    toast.success(`Encaminhado para ${caseItem.suggestedDestination ?? 'Especialista'}.`);
  };

  const handleMarkCompleted = () => {
    mutate({ type: 'MARK_COMPLETED', caseId: caseItem.id });
    toast.success('Caso marcado como concluído.');
  };

  return (
    <AppShell role={UserRole.PROFESSIONAL}>
      <div className="space-y-4">
        {/* Back button + header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/casos')} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Casos
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold">{caseItem.patient.fullName}</h1>
            <p className="text-sm text-muted-foreground">{caseItem.chiefComplaint}</p>
          </div>
          <Link to="/revisao-clinica">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Revisão Clínica
            </Button>
          </Link>
        </div>

        {/* Urgent banner */}
        {isUrgent && (
          <UrgentBanner message={`Caso com classificação ${caseItem.riskLevel === RiskLevel.EMERGENCY ? 'EMERGÊNCIA' : 'MUITO URGENTE'} — prioridade ${caseItem.priorityScore}/100`} />
        )}

        {/* Status + Risk bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
          <RiskBadge level={caseItem.riskLevel} size="md" />
          <Badge variant={statusCfg.variant} className="text-xs">{statusCfg.label}</Badge>
          {caseItem.reviewedBy && (
            <Badge variant="outline" className="text-xs">✓ Revisado por {caseItem.reviewedBy}</Badge>
          )}
          {caseItem.aiConfidence && (
            <span className="ml-auto text-xs text-muted-foreground">
              IA: {caseItem.aiConfidence}% confiança
            </span>
          )}
          <span className="text-xs text-muted-foreground font-mono">{caseItem.id}</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left column: patient + intake */}
          <div className="space-y-4 lg:col-span-2">
            {/* Patient summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-display">
                  <User className="h-4 w-4 text-primary" />
                  Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Nome:</span> <span className="font-medium">{caseItem.patient.fullName}</span></div>
                  {caseItem.patient.cpf && <div><span className="text-muted-foreground">CPF:</span> <span className="font-medium">{caseItem.patient.cpf}</span></div>}
                  {caseItem.patient.birthDate && <div><span className="text-muted-foreground">Nascimento:</span> <span className="font-medium">{new Date(caseItem.patient.birthDate).toLocaleDateString('pt-BR')}</span></div>}
                  {caseItem.patient.gender && <div><span className="text-muted-foreground">Sexo:</span> <span className="font-medium">{caseItem.patient.gender === 'M' ? 'Masculino' : caseItem.patient.gender === 'F' ? 'Feminino' : 'Outro'}</span></div>}
                  {caseItem.patient.chronicConditions && caseItem.patient.chronicConditions.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Condições crônicas:</span>{' '}
                      <span className="font-medium">{caseItem.patient.chronicConditions.join(', ')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clinical summary */}
            {intake?.clinicalSummary && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-display">
                    <FileText className="h-4 w-4 text-primary" />
                    Resumo Clínico (IA)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed">{intake.clinicalSummary.narrative}</p>
                  {intake.clinicalSummary.structuredFindings.length > 0 && (
                    <ul className="space-y-1">
                      {intake.clinicalSummary.structuredFindings.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  {intake.clinicalSummary.suspectedConditions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {intake.clinicalSummary.suspectedConditions.map((c, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-muted/50">{c}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Exams */}
            {intake?.examSuggestions && intake.examSuggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-display">
                    <FlaskConical className="h-4 w-4 text-secondary" />
                    Exames ({intake.examSuggestions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {intake.examSuggestions.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{exam.examName}</p>
                        <p className="text-xs text-muted-foreground">{exam.justification}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={exam.priority === 'URGENT' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {exam.priority === 'URGENT' ? 'Urgente' : 'Rotina'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{exam.status}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Referral */}
            {intake?.referralRecommendation && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-display">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Recomendação de Encaminhamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs">
                      {intake.referralRecommendation.decision === 'RESOLVE_PRIMARY' ? 'Resolver na UBS' :
                       intake.referralRecommendation.decision === 'REFER_SPECIALIST' ? 'Encaminhar Especialista' :
                       intake.referralRecommendation.decision === 'REFER_EMERGENCY' ? 'Emergência' : 'Mais dados'}
                    </Badge>
                    {intake.referralRecommendation.specialty && (
                      <Badge variant="outline" className="text-xs">{intake.referralRecommendation.specialty}</Badge>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      Confiança: {intake.referralRecommendation.confidence}%
                    </span>
                  </div>
                  <p className="text-sm">{intake.referralRecommendation.justification}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column: metadata + actions + journey */}
          <div className="space-y-4">
            {/* Case metadata */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-display">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  Dados do Caso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prioridade</span>
                  <span className="font-display font-bold">{caseItem.priorityScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destino</span>
                  <span className="font-medium">{caseItem.suggestedDestination ?? 'UBS'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unidade</span>
                  <span className="font-medium">{caseItem.assignedUnitName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revisão</span>
                  <Badge variant={caseItem.reviewStatus === 'completed' ? 'default' : caseItem.reviewStatus === 'in_progress' ? 'secondary' : 'outline'} className="text-[10px]">
                    {caseItem.reviewStatus === 'completed' ? 'Revisado' : caseItem.reviewStatus === 'in_progress' ? 'Em Revisão' : 'Pendente'}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Criado</span>
                  <span>{new Date(caseItem.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Atualizado</span>
                  <span>{new Date(caseItem.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {caseItem.reviewStatus !== 'completed' && (
                  <Button size="sm" className="w-full gap-1.5" onClick={handleApproveReview}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aprovar Revisão
                  </Button>
                )}
                {caseItem.status !== CaseStatus.EXAMS_REQUESTED && caseItem.status !== CaseStatus.COMPLETED && (
                  <Button size="sm" variant="secondary" className="w-full gap-1.5" onClick={handleRequestExams}>
                    <FlaskConical className="h-3.5 w-3.5" />
                    Solicitar Exames
                  </Button>
                )}
                {caseItem.suggestedDestination && caseItem.status !== CaseStatus.REFERRED && caseItem.status !== CaseStatus.COMPLETED && (
                  <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={handleMarkReferred}>
                    <Stethoscope className="h-3.5 w-3.5" />
                    Encaminhar
                  </Button>
                )}
                {caseItem.status !== CaseStatus.COMPLETED && (
                  <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={handleMarkCompleted}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Marcar Concluído
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Journey timeline */}
            {journey && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-display">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Jornada de Cuidado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <JourneyTimeline steps={journey.steps} currentStepIndex={journey.currentStepIndex} />
                </CardContent>
              </Card>
            )}

            {/* Navigation links */}
            <div className="space-y-2">
              <Link to="/revisao-clinica" className="block">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Revisão Clínica</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link to="/dashboard-clinico" className="block">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
