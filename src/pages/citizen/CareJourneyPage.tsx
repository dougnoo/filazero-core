import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { Route as RouteIcon } from 'lucide-react';

export default function CareJourneyPage() {
  return (
    <AppShell role={UserRole.CITIZEN}>
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Minha Jornada</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe cada etapa do seu atendimento
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-16 text-center">
          <RouteIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Timeline da Jornada</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Intake → Exames → Encaminhamento → Consulta → Acompanhamento
          </p>
        </div>
      </div>
    </AppShell>
  );
}
