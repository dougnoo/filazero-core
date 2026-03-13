/**
 * Cases Page — Central case management module.
 *
 * Reads from CaseStore (single source of truth).
 * Links to case detail, clinical review, and dashboard.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { UserRole } from '@/domain/enums/user-role';
import { CasesTable } from '@/features/cases/CasesTable';
import { CaseFiltersBar } from '@/features/cases/CaseFilters';
import { EmptyState, UrgentBanner } from '@/components/shared/DataState';
import { useCaseStore } from '@/contexts/CaseStore';
import { CaseStatus } from '@/domain/enums/case-status';
import { RiskLevel } from '@/domain/enums/risk-level';
import type { Case } from '@/domain/types/case';
import type { CaseFilters } from '@/services/case-service';
import { ClipboardList } from 'lucide-react';

export default function CasesPage() {
  const navigate = useNavigate();
  const { cases, dashboard } = useCaseStore();
  const [filters, setFilters] = useState<CaseFilters>({});

  const filteredCases = useMemo(() => {
    let results = [...cases];

    if (filters.status) {
      results = results.filter((c) => c.status === filters.status);
    }
    if (filters.riskLevel) {
      results = results.filter((c) => c.riskLevel === filters.riskLevel);
    }
    if (filters.reviewStatus) {
      results = results.filter((c) => c.reviewStatus === filters.reviewStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.patient.fullName.toLowerCase().includes(q) ||
          c.chiefComplaint.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q),
      );
    }

    results.sort((a, b) => b.priorityScore - a.priorityScore);
    return results;
  }, [cases, filters]);

  const urgentCount = filteredCases.filter(
    (c) => c.riskLevel === RiskLevel.EMERGENCY || c.riskLevel === RiskLevel.VERY_URGENT,
  ).length;

  const handleSelectCase = (caseItem: Case) => {
    navigate(`/casos/${caseItem.id}`);
  };

  return (
    <AppShell role={UserRole.PROFESSIONAL}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold">Central de Casos</h1>
          <p className="text-sm text-muted-foreground">
            {dashboard.totalActive} ativos · {dashboard.pendingReviews} aguardando revisão · {dashboard.totalCompleted} concluídos
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
          counts={dashboard.byStatus}
        />

        {/* Content */}
        {filteredCases.length === 0 ? (
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
          <CasesTable cases={filteredCases} onSelectCase={handleSelectCase} />
        )}
      </div>
    </AppShell>
  );
}
