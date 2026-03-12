import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { IntakeChat } from '@/components/intake/IntakeChat';
import { IntakeResult } from '@/components/intake/IntakeResult';
import { UserRole } from '@/domain/enums/user-role';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';

export default function ClinicalIntakePage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<ClinicalIntake | null>(null);

  const handleComplete = useCallback((intake: ClinicalIntake) => {
    setResult(intake);
  }, []);

  const handleViewJourney = () => {
    navigate('/minha-jornada');
  };

  if (result) {
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

  return (
    <AppShell role={UserRole.CITIZEN}>
      <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-lg flex-col">
        <IntakeChat onComplete={handleComplete} />
      </div>
    </AppShell>
  );
}
