import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { IntakeChat } from '@/features/intake/IntakeChat';
import { IntakeResult } from '@/features/intake/IntakeResult';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';

export default function CitizenTriage() {
  const [result, setResult] = useState<ClinicalIntake | null>(null);
  const navigate = useNavigate();

  if (result) {
    return (
      <AppShell role={UserRole.CITIZEN}>
        <IntakeResult intake={result} onViewJourney={() => navigate('/cidadao/jornada')} />
      </AppShell>
    );
  }

  return (
    <AppShell role={UserRole.CITIZEN}>
      <div className="mx-auto h-[calc(100vh-4rem)] max-w-lg">
        <IntakeChat onComplete={setResult} />
      </div>
    </AppShell>
  );
}
