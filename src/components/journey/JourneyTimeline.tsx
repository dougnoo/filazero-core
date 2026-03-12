import { CheckCircle2, Circle, Loader2, AlertCircle, SkipForward } from 'lucide-react';
import { CareStepStatus } from '@/domain/enums/care-step-status';
import type { CareStep } from '@/domain/types/care-journey';
import { cn } from '@/lib/utils';

interface JourneyTimelineProps {
  steps: CareStep[];
  currentStepIndex: number;
}

const STATUS_ICON: Record<CareStepStatus, typeof Circle> = {
  [CareStepStatus.COMPLETED]: CheckCircle2,
  [CareStepStatus.IN_PROGRESS]: Loader2,
  [CareStepStatus.PENDING]: Circle,
  [CareStepStatus.BLOCKED]: AlertCircle,
  [CareStepStatus.SKIPPED]: SkipForward,
};

const STATUS_STYLES: Record<CareStepStatus, { dot: string; line: string; label: string; iconClass: string }> = {
  [CareStepStatus.COMPLETED]: {
    dot: 'bg-primary text-primary-foreground',
    line: 'bg-primary',
    label: 'text-foreground',
    iconClass: '',
  },
  [CareStepStatus.IN_PROGRESS]: {
    dot: 'bg-primary/15 text-primary border-2 border-primary',
    line: 'bg-border',
    label: 'text-foreground font-semibold',
    iconClass: 'animate-spin',
  },
  [CareStepStatus.PENDING]: {
    dot: 'bg-muted text-muted-foreground border border-border',
    line: 'bg-border',
    label: 'text-muted-foreground',
    iconClass: '',
  },
  [CareStepStatus.BLOCKED]: {
    dot: 'bg-destructive/10 text-destructive border border-destructive/30',
    line: 'bg-border',
    label: 'text-destructive',
    iconClass: '',
  },
  [CareStepStatus.SKIPPED]: {
    dot: 'bg-muted text-muted-foreground/50 border border-border',
    line: 'bg-border',
    label: 'text-muted-foreground line-through',
    iconClass: '',
  },
};

function formatStepDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function JourneyTimeline({ steps, currentStepIndex }: JourneyTimelineProps) {
  return (
    <div className="relative space-y-0">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const isCurrent = idx === currentStepIndex;
        const styles = STATUS_STYLES[step.status];
        const Icon = STATUS_ICON[step.status];

        return (
          <div key={step.id} className="relative flex gap-3">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all',
                styles.dot,
                isCurrent && 'ring-4 ring-primary/10'
              )}>
                <Icon className={cn('h-4 w-4', styles.iconClass)} />
              </div>
              {!isLast && (
                <div className={cn('w-0.5 flex-1 min-h-[2rem]', styles.line)} />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p className={cn('text-sm leading-tight pt-1', styles.label)}>
                {step.label}
              </p>
              {step.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
              )}
              {(step.completedAt || step.startedAt) && (
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                  {step.completedAt
                    ? `Concluído em ${formatStepDate(step.completedAt)}`
                    : step.status === CareStepStatus.IN_PROGRESS
                      ? `Iniciado em ${formatStepDate(step.startedAt)}`
                      : ''
                  }
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
