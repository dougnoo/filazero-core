import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { LayoutDashboard } from 'lucide-react';

export default function ManagerDashboard() {
  return (
    <AppShell role={UserRole.MANAGER}>
      <div>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral das filas e atendimentos</p>
        </div>

        {/* Dashboard placeholder — will be built in Step 7 */}
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-16 text-center">
          <LayoutDashboard className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Dashboard do Gestor</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Será implementado no Step 7</p>
        </div>
      </div>
    </AppShell>
  );
}
