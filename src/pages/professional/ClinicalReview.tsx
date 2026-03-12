import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { FileText } from 'lucide-react';

export default function ClinicalReview() {
  return (
    <AppShell role={UserRole.PROFESSIONAL}>
      <div>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Revisão Clínica</h1>
          <p className="text-sm text-muted-foreground">
            Pacotes clínicos para revisão e validação médica
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Revisão de Pacotes Clínicos</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Resumo + Exames sugeridos + Recomendação de encaminhamento
          </p>
        </div>
      </div>
    </AppShell>
  );
}
