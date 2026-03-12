import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { MessageSquare } from 'lucide-react';

export default function ClinicalIntake() {
  return (
    <AppShell role={UserRole.CITIZEN}>
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold">Atendimento Clínico</h1>
          <p className="text-sm text-muted-foreground">
            Descreva seus sintomas para a inteligência clínica
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-16 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Chat de Intake Clínico</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Coleta estruturada → Resumo → Exames → Recomendação
          </p>
        </div>
      </div>
    </AppShell>
  );
}
