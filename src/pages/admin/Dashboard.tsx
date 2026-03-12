import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { Settings } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <AppShell role={UserRole.ADMIN}>
      <div>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Administração</h1>
          <p className="text-sm text-muted-foreground">Painel administrativo do FilaZero</p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-16 text-center">
          <Settings className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Painel Admin</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Post-MVP</p>
        </div>
      </div>
    </AppShell>
  );
}
