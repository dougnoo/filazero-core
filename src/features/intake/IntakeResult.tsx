import {
  FileText,
  FlaskConical,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RiskBadge } from '@/components/patient/RiskBadge';
import { cn } from '@/lib/utils';
import type { ClinicalIntake, ExamSuggestion } from '@/domain/types/clinical-intake';

interface IntakeResultProps {
  intake: ClinicalIntake;
  onViewJourney: () => void;
}

const DECISION_CONFIG: Record<string, { label: string; description: string; icon: typeof ArrowRight; className: string }> = {
  RESOLVE_PRIMARY: {
    label: 'Resolver na UBS',
    description: 'Seu caso pode ser resolvido na atenção primária.',
    icon: CheckCircle2,
    className: 'text-primary',
  },
  REFER_SPECIALIST: {
    label: 'Encaminhamento para Especialista',
    description: 'Recomendamos avaliação com especialista após exames iniciais.',
    icon: ArrowRight,
    className: 'text-secondary',
  },
  REFER_EMERGENCY: {
    label: 'Encaminhamento de Urgência',
    description: 'Seu caso requer atendimento de emergência imediato.',
    icon: AlertTriangle,
    className: 'text-destructive',
  },
  NEEDS_MORE_DATA: {
    label: 'Mais Informações Necessárias',
    description: 'Precisamos de exames ou informações adicionais.',
    icon: Clock,
    className: 'text-muted-foreground',
  },
};

const EXAM_CATEGORY_LABEL: Record<string, string> = {
  LABORATORY: 'Laboratorial',
  IMAGING: 'Imagem',
  FUNCTIONAL: 'Funcional',
  OTHER: 'Outro',
};

function ExamCard({ exam }: { exam: ExamSuggestion }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <div className={cn(
        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
        exam.priority === 'URGENT' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
      )}>
        <FlaskConical className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{exam.examName}</span>
          {exam.priority === 'URGENT' && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Urgente</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{EXAM_CATEGORY_LABEL[exam.category]}</span>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{exam.justification}</p>
      </div>
    </div>
  );
}

export function IntakeResult({ intake, onViewJourney }: IntakeResultProps) {
  const { clinicalSummary, examSuggestions, referralRecommendation } = intake;
  const decision = referralRecommendation
    ? DECISION_CONFIG[referralRecommendation.decision]
    : null;
  const DecisionIcon = decision?.icon || ArrowRight;

  return (
    <div className="space-y-4 pb-6">
      {/* Risk + Chief Complaint header */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Queixa principal</p>
            <p className="mt-1 font-display text-base font-semibold text-foreground">
              {intake.chiefComplaint}
            </p>
          </div>
          <RiskBadge level={intake.riskLevel} size="md" />
        </div>
        {intake.symptoms.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {intake.symptoms.map((s, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Referral Decision — prominent */}
      {referralRecommendation && decision && (
        <Card className="border-2 border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted', decision.className)}>
                <DecisionIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn('font-display text-sm font-bold', decision.className)}>
                  {decision.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{decision.description}</p>
                {referralRecommendation.specialty && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground">
                    <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                    Especialidade: <span className="font-medium">{referralRecommendation.specialty}</span>
                  </div>
                )}
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {referralRecommendation.justification}
                </p>
                {referralRecommendation.confidence > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${referralRecommendation.confidence}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {referralRecommendation.confidence}% confiança
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Summary */}
      {clinicalSummary && (
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              Resumo Clínico
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {clinicalSummary.narrative}
            </p>
            {clinicalSummary.structuredFindings.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Achados principais</p>
                  <ul className="space-y-1.5">
                    {clinicalSummary.structuredFindings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {clinicalSummary.suspectedConditions.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <ShieldAlert className="mr-1 inline-block h-3.5 w-3.5" />
                    Condições investigadas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {clinicalSummary.suspectedConditions.map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs font-normal">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Suggested Exams */}
      {examSuggestions && examSuggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FlaskConical className="h-4 w-4 text-primary" />
              Exames Sugeridos
              <Badge variant="secondary" className="ml-auto text-xs">{examSuggestions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {examSuggestions.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* What happens next */}
      {referralRecommendation?.alternativeActions && referralRecommendation.alternativeActions.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm">Próximos passos na UBS</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {referralRecommendation.alternativeActions.map((a, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <ChevronRight className="h-3.5 w-3.5 text-primary" />
                  {a}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Button onClick={onViewJourney} className="w-full" size="lg">
        Acompanhar Minha Jornada
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
