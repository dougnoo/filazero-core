import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { Clock } from 'lucide-react';

export default function CitizenQueueStatus() {
  return (
    <AppShell role={UserRole.CITIZEN}>
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-xl font-bold">Minha Fila</h1>
          <p className="text-sm text-muted-foreground">Acompanhe sua posição na fila</p>
        </div>

        {/* Queue status placeholder — will be built in Step 5 */}
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <Clock className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Status da Fila</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Será implementado no Step 5</p>
        </div>
      </div>
    </AppShell>
  );
}
