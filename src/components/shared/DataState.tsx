/**
 * DataState — Reusable UI states for data-driven components.
 *
 * Provides consistent empty, loading, and error states across the app.
 */

import { AlertCircle, FileX, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Loading ───

export function LoadingState({
  message = 'Carregando...',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="mt-2 text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

// ─── Empty ───

export function EmptyState({
  title = 'Nenhum item encontrado',
  description,
  icon: Icon = FileX,
  action,
  className = '',
}: {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-16 text-center ${className}`}>
      <Icon className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="font-display font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">{description}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ─── Error ───

export function ErrorState({
  title = 'Erro ao carregar dados',
  description,
  onRetry,
  className = '',
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center ${className}`}>
      <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
      <p className="font-display font-medium text-destructive">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

// ─── Urgent Banner ───

export function UrgentBanner({
  message,
  className = '',
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 ${className}`}>
      <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
      <p className="text-sm font-medium text-destructive">{message}</p>
    </div>
  );
}
