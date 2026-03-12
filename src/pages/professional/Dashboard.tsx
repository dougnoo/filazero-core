import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { ListChecks } from 'lucide-react';

export default function ProfessionalDashboard() {
  return (
    <AppShell role={UserRole.PROFESSIONAL}>
      <div>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Fila de Triagem</h1>
          <p className="text-sm text-muted-foreground">Pacientes aguardando atendimento</p>
        </div>

        {/* Queue list placeholder — will be built in Step 6 */}
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-16 text-center">
          <ListChecks className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Lista de Pacientes Priorizada</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Será implementado no Step 6</p>
        </div>
      </div>
    </AppShell>
  );
}
