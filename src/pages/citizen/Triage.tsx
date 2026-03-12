import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CitizenTriage() {
  return (
    <AppShell role={UserRole.CITIZEN}>
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-xl font-bold">Triagem Inteligente</h1>
          <p className="text-sm text-muted-foreground">Descreva seus sintomas para nossa IA</p>
        </div>

        {/* Chat placeholder — will be built in Step 4 */}
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Chat de Triagem</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Será implementado no Step 4</p>
        </div>
      </div>
    </AppShell>
  );
}
