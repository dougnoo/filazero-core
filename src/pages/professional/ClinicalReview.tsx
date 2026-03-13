import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { CaseList } from '@/features/clinical-review/CaseList';
import { CaseDetail } from '@/features/clinical-review/CaseDetail';
import { getPendingClinicalPackages, type ClinicalPackage } from '@/services/clinical-review-service';
import { FileText, Loader2 } from 'lucide-react';

export default function ClinicalReview() {
  const [packages, setPackages] = useState<ClinicalPackage[]>([]);
  const [selected, setSelected] = useState<ClinicalPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingClinicalPackages()
      .then((data) => {
        setPackages(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch((err) => {
        console.error('[ClinicalReview] Failed to load:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AppShell role={UserRole.PROFESSIONAL}>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold">Revisão Clínica</h1>
        <p className="text-sm text-muted-foreground">
          Pacotes clínicos para revisão e validação médica
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando pacotes...</span>
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-display font-medium text-muted-foreground">Nenhum pacote pendente</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Todos os pacotes clínicos foram revisados.
          </p>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border bg-card">
          {/* Left: Case List */}
          <div className="w-80 shrink-0 border-r lg:w-96">
            <CaseList
              packages={packages}
              selectedId={selected?.journey.id ?? null}
              onSelect={setSelected}
            />
          </div>

          {/* Right: Detail */}
          <div className="flex-1">
            {selected ? (
              <CaseDetail pkg={selected} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Selecione um pacote clínico para revisar.
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
