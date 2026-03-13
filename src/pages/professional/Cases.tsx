/**
 * Cases Page — Central case management module.
 *
 * Links all flows: intake, clinical result, care journey,
 * professional review, and manager dashboard.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { CasesTable } from '@/features/cases/CasesTable';
import { CaseFiltersBar } from '@/features/cases/CaseFilters';
import { LoadingState, EmptyState, ErrorState, UrgentBanner } from '@/components/shared/DataState';
import { getCases, getCaseCountsByStatus, type CaseFilters } from '@/services/case-service';
import { CaseStatus } from '@/domain/enums/case-status';
import { RiskLevel } from '@/domain/enums/risk-level';
import type { Case } from '@/domain/types/case';
import { ClipboardList } from 'lucide-react';

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [counts, setCounts] = useState<Record<CaseStatus, number> | null>(null);
  const [filters, setFilters] = useState<CaseFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [casesData, countsData] = await Promise.all([
        getCases(filters),
        getCaseCountsByStatus(),
      ]);
      setCases(casesData);
      setCounts(countsData);
    } catch (err) {
      console.error('[Cases] Failed to load:', err);
      setError('Não foi possível carregar os casos.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const urgentCount = cases.filter(
    (c) => c.riskLevel === RiskLevel.EMERGENCY || c.riskLevel === RiskLevel.VERY_URGENT,
  ).length;

  const handleSelectCase = (caseItem: Case) => {
    // Navigate to clinical review with the journey context
    navigate(`/revisao-clinica`);
  };

  return (
    <AppShell role={UserRole.PROFESSIONAL}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold">Central de Casos</h1>
          <p className="text-sm text-muted-foreground">
            Visão unificada de todos os casos clínicos da unidade
          </p>
        </div>

        {/* Urgent banner */}
        {urgentCount > 0 && (
          <UrgentBanner
            message={`${urgentCount} caso${urgentCount > 1 ? 's' : ''} com classificação de risco alta ou emergência`}
          />
        )}

        {/* Filters */}
        <CaseFiltersBar
          filters={filters}
          onChange={setFilters}
          counts={counts ?? undefined}
        />

        {/* Content */}
        {error ? (
          <ErrorState description={error} onRetry={loadData} />
        ) : loading ? (
          <LoadingState message="Carregando casos..." />
        ) : cases.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum caso encontrado"
            description="Ajuste os filtros ou aguarde novos casos serem registrados."
            action={filters.search || filters.status || filters.riskLevel || filters.reviewStatus
              ? { label: 'Limpar filtros', onClick: () => setFilters({}) }
              : undefined
            }
          />
        ) : (
          <CasesTable cases={cases} onSelectCase={handleSelectCase} />
        )}
      </div>
    </AppShell>
  );
}
