/**
 * CaseFilters — Filter bar for the Cases module.
 */

import { CaseStatus, caseStatusConfig } from '@/domain/enums/case-status';
import { RiskLevel, riskLevelConfig } from '@/domain/enums/risk-level';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { CaseFilters as CaseFiltersType } from '@/services/case-service';

interface CaseFiltersProps {
  filters: CaseFiltersType;
  onChange: (filters: CaseFiltersType) => void;
  counts?: Record<CaseStatus, number>;
}

export function CaseFiltersBar({ filters, onChange, counts }: CaseFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, queixa ou ID..."
          className="pl-9"
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
        />
      </div>

      {/* Status filter */}
      <Select
        value={filters.status ?? 'ALL'}
        onValueChange={(v) => onChange({ ...filters, status: v === 'ALL' ? undefined : v as CaseStatus })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os status</SelectItem>
          {Object.entries(caseStatusConfig).map(([key, cfg]) => (
            <SelectItem key={key} value={key}>
              {cfg.label} {counts?.[key as CaseStatus] !== undefined ? `(${counts[key as CaseStatus]})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Risk filter */}
      <Select
        value={filters.riskLevel ?? 'ALL'}
        onValueChange={(v) => onChange({ ...filters, riskLevel: v === 'ALL' ? undefined : v as RiskLevel })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Risco" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os riscos</SelectItem>
          {Object.entries(riskLevelConfig).map(([key, cfg]) => (
            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Review status */}
      <Select
        value={filters.reviewStatus ?? 'ALL'}
        onValueChange={(v) => onChange({ ...filters, reviewStatus: v === 'ALL' ? undefined : v as 'pending' | 'in_progress' | 'completed' })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Revisão" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas revisões</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="in_progress">Em Revisão</SelectItem>
          <SelectItem value="completed">Revisado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
