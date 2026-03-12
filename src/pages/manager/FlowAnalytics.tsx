import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { BarChart3 } from 'lucide-react';

export default function FlowAnalytics() {
  return (
    <AppShell role={UserRole.MANAGER}>
      <div>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Fluxo de Atendimento</h1>
          <p className="text-sm text-muted-foreground">
            Análise de fluxo da rede de saúde
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-16 text-center">
          <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Análise de Fluxo</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            UBS → Especialista → Hospital
          </p>
        </div>
      </div>
    </AppShell>
  );
}
