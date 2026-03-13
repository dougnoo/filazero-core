import { useState } from 'react';
import {
  FileText, FlaskConical, ArrowRight, AlertTriangle, CheckCircle2,
  XCircle, MessageSquarePlus, Stethoscope, Activity, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RiskBadge } from '@/components/patient/RiskBadge';
import { careJourneyStatusConfig } from '@/domain/enums/care-journey-status';
import { careStepStatusConfig, CareStepStatus } from '@/domain/enums/care-step-status';
import { cn } from '@/lib/utils';
import type { ClinicalPackage } from '@/services/clinical-review-service';
import { submitValidation } from '@/services/clinical-review-service';
import type { ValidationActionType } from '@/domain/contracts/trya-backend';
import { toast } from 'sonner';

interface CaseDetailProps {
  pkg: ClinicalPackage;
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

export function CaseDetail({ pkg }: CaseDetailProps) {
  const { journey, intake } = pkg;
  const { clinicalSummary, examSuggestions, referralRecommendation } = intake;
  const [validating, setValidating] = useState<ValidationActionType | null>(null);

  const handleAction = async (action: ValidationActionType) => {
    setValidating(action);
    try {
      const result = await submitValidation({ journeyId: journey.id, action });
      if (result.success) {
        toast.success(result.message ?? 'Ação registrada com sucesso.');
      } else {
        toast.error('Validação não foi aceita pelo backend.');
      }
    } catch {
      toast.error('Erro ao processar ação.');
    } finally {
      setValidating(null);
    }
  };

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
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Clinical Summary */}
        {clinicalSummary && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-display">
                <FileText className="h-4 w-4 text-primary" />
                Resumo Clínico
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

        {/* Suggested Exams */}
        {examSuggestions && examSuggestions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-display">
                <FlaskConical className="h-4 w-4 text-secondary" />
                Exames Sugeridos ({examSuggestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {examSuggestions.map((exam) => (
                  <div key={exam.id} className="rounded-lg border p-3">
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
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px]',
                          exam.status === 'COMPLETED' && 'border-primary/30 text-primary',
                          exam.status === 'REQUESTED' && 'border-secondary/30 text-secondary',
                        )}
                      >
                        {exam.status === 'SUGGESTED' && 'Sugerido'}
                        {exam.status === 'REQUESTED' && 'Solicitado'}
                        {exam.status === 'COMPLETED' && 'Concluído'}
                        {exam.status === 'CANCELLED' && 'Cancelado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referral Recommendation */}
        {referralRecommendation && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-display">
                <ArrowRight className="h-4 w-4 text-primary" />
                Recomendação de Encaminhamento
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
                  Confiança: {referralRecommendation.confidence}%
                </span>
              </div>

              <p className="text-sm leading-relaxed">{referralRecommendation.justification}</p>

              {referralRecommendation.requiredExamsBeforeReferral.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Exames Necessários Antes do Encaminhamento
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
                    Ações Alternativas na Atenção Primária
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
            </CardContent>
          </Card>
        )}

        {/* Journey Snapshot */}
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
                    {step.status === CareStepStatus.IN_PROGRESS && <Activity className="h-4 w-4 shrink-0 text-secondary animate-pulse-soft" />}
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

        {/* Validation Actions */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-display">
              <Stethoscope className="h-4 w-4 text-primary" />
              Ações de Validação Médica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              Revise o pacote clínico acima e tome uma decisão sobre os exames e encaminhamento sugeridos.
            </p>

            <Separator className="my-3" />

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Exames</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAction('APPROVE_EXAMS')}
                  disabled={validating !== null}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Aprovar Exames
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('REJECT_EXAMS')}
                  disabled={validating !== null}
                  className="gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Rejeitar Exames
                </Button>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Encaminhamento</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAction('APPROVE_REFERRAL')}
                  disabled={validating !== null}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Aprovar Encaminhamento
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('REJECT_REFERRAL')}
                  disabled={validating !== null}
                  className="gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Rejeitar Encaminhamento
                </Button>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outras Ações</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAction('RESOLVE_PRIMARY')}
                  disabled={validating !== null}
                  className="gap-1.5"
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  Resolver na UBS
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAction('REQUEST_MORE_INFO')}
                  disabled={validating !== null}
                  className="gap-1.5"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  Solicitar Mais Informações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
