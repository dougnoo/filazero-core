import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { IntakeChat } from '@/components/intake/IntakeChat';
import { IntakeResult } from '@/components/intake/IntakeResult';
import { UserRole } from '@/domain/enums/user-role';
import type { TriageMessage } from '@/domain/types/triage';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { IntakePhase } from '@/services/intake-service';
import { generateIntakeResult } from '@/services/intake-service';

type IntakeView = 'chat' | 'processing' | 'result';

export default function ClinicalIntakePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<IntakeView>('chat');
  const [result, setResult] = useState<ClinicalIntake | null>(null);

  const handleChatComplete = useCallback(async (messages: TriageMessage[], _phase: IntakePhase) => {
    setView('processing');
    try {
      const intakeResult = await generateIntakeResult('intake-' + Date.now(), messages);
      setResult(intakeResult);
      setView('result');
    } catch {
      // In production, handle error with retry UI
      setView('chat');
    }
  }, []);

  const handleViewJourney = () => {
    navigate('/minha-jornada');
  };

  if (view === 'processing') {
    return (
      <AppShell role={UserRole.CITIZEN}>
        <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Processando seus dados
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nossa inteligência clínica está analisando suas informações
              para gerar seu resumo e recomendações.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
              Estruturando dados clínicos
            </span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (view === 'result' && result) {
    return (
      <AppShell role={UserRole.CITIZEN}>
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="mb-4 text-center">
            <h1 className="font-display text-xl font-bold text-foreground">
              Resultado da Avaliação
            </h1>
            <p className="text-sm text-muted-foreground">
              Seu atendimento foi processado pela inteligência clínica
            </p>
          </div>
          <IntakeResult intake={result} onViewJourney={handleViewJourney} />
        </div>
      </AppShell>
    );
  }

  // Chat view
  return (
    <AppShell role={UserRole.CITIZEN}>
      <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-lg flex-col">
        <IntakeChat onComplete={handleChatComplete} />
      </div>
    </AppShell>
  );
}
