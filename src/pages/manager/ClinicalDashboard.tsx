import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { Activity } from 'lucide-react';

export default function ClinicalDashboard() {
  return (
    <AppShell role={UserRole.MANAGER}>
      <div>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Dashboard Clínico</h1>
          <p className="text-sm text-muted-foreground">
            Métricas de fluxo, resolutividade e inteligência clínica
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-16 text-center">
          <Activity className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Analytics de Fluxo Clínico</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Resolutividade · Encaminhamentos · Tempo médio · Gargalos
          </p>
        </div>
      </div>
    </AppShell>
  );
}
