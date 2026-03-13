import { useState } from 'react';
import {
  FileText, FlaskConical, ArrowRight, AlertTriangle, CheckCircle2,
  XCircle, MessageSquarePlus, Stethoscope, Activity, Clock,
  Send, Clipboard, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RiskBadge } from '@/features/shared/RiskBadge';
import { careJourneyStatusConfig, CareJourneyStatus } from '@/domain/enums/care-journey-status';
import { careStepStatusConfig, CareStepStatus } from '@/domain/enums/care-step-status';
import { cn } from '@/lib/utils';
import type { ClinicalPackage } from '@/services/clinical-review-service';
import { submitValidation } from '@/services/clinical-review-service';
import type { ValidationActionType } from '@/domain/contracts/trya-backend';
import { toast } from 'sonner';

interface CaseDetailProps {
  pkg: ClinicalPackage;
  onValidationComplete?: (journeyId: string, action: string, newStatus: CareJourneyStatus) => void;
}

const referralDecisionLabels: Record<string, string> = {
  RESOLVE_PRIMARY: 'Resolver na Atenção Primária',
  REFER_SPECIALIST: 'Encaminhar para Especialista',
  REFER_EMERGENCY: 'Encaminhar para Emergência',
  NEEDS_MORE_DATA: 'Mais Dados Necessários',
};

const examCategoryLabels: Record<string, string> = {
  LABORATORY: 'Laboratorial',
  IMAGING: 'Imagem',
  FUNCTIONAL: 'Funcional',
  OTHER: 'Outro',
};

const ACTION_LABELS: Record<string, string> = {
  APPROVE_EXAMS: 'Exames aprovados',
  REJECT_EXAMS: 'Exames rejeitados',
  APPROVE_REFERRAL: 'Encaminhamento aprovado',
  REJECT_REFERRAL: 'Encaminhamento rejeitado',
  RESOLVE_PRIMARY: 'Caso resolvido na UBS',
  REQUEST_MORE_INFO: 'Mais informações solicitadas',
};

export function CaseDetail({ pkg, onValidationComplete }: CaseDetailProps) {
  const { journey, intake } = pkg;
  const { clinicalSummary, examSuggestions, referralRecommendation } = intake;
  const [validating, setValidating] = useState<ValidationActionType | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [examStates, setExamStates] = useState<Record<string, 'approved' | 'rejected' | null>>(
    () => Object.fromEntries((examSuggestions ?? []).map((e) => [e.id, null]))
  );

  const handleAction = async (action: ValidationActionType) => {
    setValidating(action);
    try {
      const result = await submitValidation({
        journeyId: journey.id,
        action,
        notes: doctorNotes || undefined,
      });
      if (result.success) {
        setCompletedActions((prev) => new Set([...prev, action]));
        toast.success(
          <div className="space-y-1">
            <p className="font-semibold">{ACTION_LABELS[action]}</p>
            <p className="text-xs text-muted-foreground">Paciente: {journey.citizenName}</p>
            {doctorNotes && <p className="text-xs italic">"{doctorNotes}"</p>}
          </div>
        );
        onValidationComplete?.(journey.id, action, result.newStatus);
      } else {
        toast.error('Validação não foi aceita.');
      }
    } catch {
      toast.error('Erro ao processar ação.');
    } finally {
      setValidating(null);
    }
  };

  const handleExamToggle = (examId: string, decision: 'approved' | 'rejected') => {
    setExamStates((prev) => ({
      ...prev,
      [examId]: prev[examId] === decision ? null : decision,
    }));
  };

  const approvedExams = Object.values(examStates).filter((v) => v === 'approved').length;
  const totalExams = examSuggestions?.length ?? 0;
  const allExamsDecided = Object.values(examStates).every((v) => v !== null);

  const hasCompletedAny = completedActions.size > 0;

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">{journey.citizenName}</h2>
            <p className="text-sm text-muted-foreground">{journey.chiefComplaint}</p>
          </div>
          <RiskBadge level={journey.riskLevel} size="md" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">
            {careJourneyStatusConfig[journey.status]?.label}
          </Badge>
          {journey.targetSpecialty && (
            <Badge variant="secondary" className="text-xs">
              {journey.targetSpecialty}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            Prioridade: {journey.priorityScore}/100
          </Badge>
          {hasCompletedAny && (
            <Badge className="text-xs bg-primary">
              ✓ Validado
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Clinical Summary */}
        {clinicalSummary && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-display">
                <FileText className="h-4 w-4 text-primary" />
                Resumo Clínico (IA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">{clinicalSummary.narrative}</p>

              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Achados Estruturados</p>
                <ul className="space-y-1">
                  {clinicalSummary.structuredFindings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hipóteses Diagnósticas</p>
                <div className="flex flex-wrap gap-1.5">
                  {clinicalSummary.suspectedConditions.map((c, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-muted/50">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fatores de Risco</p>
                <div className="flex flex-wrap gap-1.5">
                  {clinicalSummary.riskFactors.map((r, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-destructive/30 text-destructive bg-destructive/5">
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>

              {clinicalSummary.relevantHistory && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Histórico Relevante</p>
                  <p className="text-sm text-muted-foreground">{clinicalSummary.relevantHistory}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══ EXAM ORDERING ═══ */}
        {examSuggestions && examSuggestions.length > 0 && (
          <Card className="border-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-display">
                <span className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-secondary" />
                  Solicitar Exames ({approvedExams}/{totalExams} aprovados)
                </span>
                {allExamsDecided && (
                  <Badge className="bg-primary text-[10px]">Todos decididos</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground">
                Revise cada exame sugerido pela IA. Aprove os necessários ou rejeite os dispensáveis.
              </p>
              <div className="space-y-3">
                {examSuggestions.map((exam) => {
                  const state = examStates[exam.id];
                  return (
                    <div
                      key={exam.id}
                      className={cn(
                        'rounded-lg border p-3 transition-colors',
                        state === 'approved' && 'border-primary/40 bg-primary/5',
                        state === 'rejected' && 'border-muted bg-muted/30 opacity-60',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{exam.examName}</p>
                            <Badge
                              variant={exam.priority === 'URGENT' ? 'destructive' : 'secondary'}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {exam.priority === 'URGENT' ? 'Urgente' : 'Rotina'}
                            </Badge>
                          </div>
                          {exam.examCode && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">SIGTAP: {exam.examCode}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {examCategoryLabels[exam.category] || exam.category}
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                        {exam.justification}
                      </p>
                      {/* Decision buttons */}
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={state === 'approved' ? 'default' : 'outline'}
                          className="h-7 gap-1 text-xs"
                          onClick={(e) => { e.stopPropagation(); handleExamToggle(exam.id, 'approved'); }}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {state === 'approved' ? 'Aprovado' : 'Aprovar'}
                        </Button>
                        <Button
                          size="sm"
                          variant={state === 'rejected' ? 'destructive' : 'ghost'}
                          className="h-7 gap-1 text-xs"
                          onClick={(e) => { e.stopPropagation(); handleExamToggle(exam.id, 'rejected'); }}
                        >
                          <XCircle className="h-3 w-3" />
                          {state === 'rejected' ? 'Rejeitado' : 'Rejeitar'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Batch approve/reject */}
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAction('APPROVE_EXAMS')}
                  disabled={validating !== null || approvedExams === 0 || completedActions.has('APPROVE_EXAMS')}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  {completedActions.has('APPROVE_EXAMS') ? '✓ Exames Enviados' : `Confirmar ${approvedExams} Exame${approvedExams > 1 ? 's' : ''}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══ REFERRAL DECISION ═══ */}
        {referralRecommendation && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-display">
                <ArrowRight className="h-4 w-4 text-primary" />
                Decisão de Encaminhamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    'text-xs',
                    referralRecommendation.decision === 'REFER_EMERGENCY' && 'bg-destructive',
                    referralRecommendation.decision === 'REFER_SPECIALIST' && 'bg-secondary',
                    referralRecommendation.decision === 'RESOLVE_PRIMARY' && 'bg-primary',
                  )}
                >
                  {referralDecisionLabels[referralRecommendation.decision] || referralRecommendation.decision}
                </Badge>
                {referralRecommendation.specialty && (
                  <Badge variant="outline" className="text-xs">{referralRecommendation.specialty}</Badge>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  Confiança IA: {referralRecommendation.confidence}%
                </span>
              </div>

              <p className="text-sm leading-relaxed">{referralRecommendation.justification}</p>

              {referralRecommendation.requiredExamsBeforeReferral.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Exames Necessários Antes
                  </p>
                  <ul className="space-y-1">
                    {referralRecommendation.requiredExamsBeforeReferral.map((e, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-3.5 w-3.5 text-risk-urgent" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {referralRecommendation.alternativeActions && referralRecommendation.alternativeActions.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Alternativas na Atenção Primária
                  </p>
                  <ul className="space-y-1">
                    {referralRecommendation.alternativeActions.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Stethoscope className="h-3.5 w-3.5 text-primary" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Action buttons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Definir jornada do paciente
                </p>
                <div className="flex flex-wrap gap-2">
                  {referralRecommendation.decision !== 'RESOLVE_PRIMARY' && (
                    <Button
                      size="sm"
                      onClick={() => handleAction('APPROVE_REFERRAL')}
                      disabled={validating !== null || completedActions.has('APPROVE_REFERRAL')}
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {completedActions.has('APPROVE_REFERRAL')
                        ? `✓ Encaminhado para ${referralRecommendation.specialty}`
                        : `Encaminhar para ${referralRecommendation.specialty ?? 'Especialista'}`}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAction('RESOLVE_PRIMARY')}
                    disabled={validating !== null || completedActions.has('RESOLVE_PRIMARY')}
                    className="gap-1.5"
                  >
                    <Stethoscope className="h-3.5 w-3.5" />
                    {completedActions.has('RESOLVE_PRIMARY') ? '✓ Resolvido na UBS' : 'Resolver na UBS'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction('REJECT_REFERRAL')}
                    disabled={validating !== null || completedActions.has('REJECT_REFERRAL')}
                    className="gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Rejeitar Encaminhamento
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══ DOCTOR NOTES ═══ */}
        <Card>
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowNotes(!showNotes)}>
            <CardTitle className="flex items-center justify-between text-sm font-display">
              <span className="flex items-center gap-2">
                <Clipboard className="h-4 w-4 text-muted-foreground" />
                Observações do Médico
              </span>
              {showNotes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
          {showNotes && (
            <CardContent>
              <Textarea
                placeholder="Adicione observações clínicas, justificativas ou instruções para a equipe..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="min-h-[100px] text-sm"
              />
              <p className="mt-2 text-[10px] text-muted-foreground">
                Estas notas serão anexadas ao prontuário e visíveis pela equipe da UBS.
              </p>
            </CardContent>
          )}
        </Card>

        {/* ═══ JOURNEY SNAPSHOT ═══ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-display">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Jornada de Cuidado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {journey.steps.map((step) => {
                const statusCfg = careStepStatusConfig[step.status];
                return (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
                      step.status === CareStepStatus.COMPLETED && 'bg-primary/5',
                      step.status === CareStepStatus.IN_PROGRESS && 'bg-secondary/10 border border-secondary/20',
                      step.status === CareStepStatus.PENDING && 'text-muted-foreground',
                      step.status === CareStepStatus.BLOCKED && 'bg-destructive/5',
                    )}
                  >
                    {step.status === CareStepStatus.COMPLETED && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                    {step.status === CareStepStatus.IN_PROGRESS && <Activity className="h-4 w-4 shrink-0 text-secondary animate-pulse" />}
                    {step.status === CareStepStatus.PENDING && <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />}
                    {step.status === CareStepStatus.BLOCKED && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                    {step.status === CareStepStatus.SKIPPED && <div className="h-4 w-4 shrink-0 rounded-full bg-muted-foreground/20" />}
                    <span className={cn(step.status === CareStepStatus.IN_PROGRESS && 'font-medium')}>
                      {step.label}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{statusCfg.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ═══ SUMMARY ACTIONS BAR ═══ */}
        {hasCompletedAny && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
            <p className="text-sm font-semibold text-primary flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Ações registradas neste pacote
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[...completedActions].map((action) => (
                <Badge key={action} className="text-xs bg-primary">
                  ✓ {ACTION_LABELS[action] ?? action}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}