import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RiskBadge } from '@/features/shared/RiskBadge';
import { Badge } from '@/components/ui/badge';
import { careJourneyStatusConfig } from '@/domain/enums/care-journey-status';
import { referralUrgencyConfig, ReferralUrgency } from '@/domain/enums/referral-urgency';
import { cn } from '@/lib/utils';
import type { ClinicalPackage } from '@/services/clinical-review-service';

interface CaseListProps {
  packages: ClinicalPackage[];
  selectedId: string | null;
  onSelect: (pkg: ClinicalPackage) => void;
}

export function CaseList({ packages, selectedId, onSelect }: CaseListProps) {
  const [search, setSearch] = useState('');

  const filtered = packages.filter((pkg) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      pkg.journey.citizenName.toLowerCase().includes(q) ||
      pkg.journey.chiefComplaint.toLowerCase().includes(q) ||
      pkg.journey.targetSpecialty?.toLowerCase().includes(q)
    );
  });

  // Sort by priority descending
  const sorted = [...filtered].sort((a, b) => b.journey.priorityScore - a.journey.priorityScore);

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente, queixa ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {sorted.length} pacote{sorted.length !== 1 ? 's' : ''} para revisão
        </p>
      </div>

      {/* Case items */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map((pkg) => {
          const { journey } = pkg;
          const isSelected = journey.id === selectedId;
          const statusLabel = careJourneyStatusConfig[journey.status]?.label;
          const urgencyLabel = journey.referralUrgency
            ? referralUrgencyConfig[journey.referralUrgency as ReferralUrgency]?.label
            : null;

          return (
            <button
              key={journey.id}
              onClick={() => onSelect(pkg)}
              className={cn(
                'w-full border-b px-4 py-3 text-left transition-colors hover:bg-muted/50',
                isSelected && 'bg-accent/60 border-l-2 border-l-primary',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold truncate">{journey.citizenName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {journey.chiefComplaint}
                  </p>
                </div>
                <RiskBadge level={journey.riskLevel} size="sm" showLabel={false} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {statusLabel}
                </Badge>
                {journey.targetSpecialty && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {journey.targetSpecialty}
                  </Badge>
                )}
                {urgencyLabel && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-destructive/30 text-destructive">
                    {urgencyLabel}
                  </Badge>
                )}
              </div>

              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Prioridade: {journey.priorityScore}/100
                </span>
              </div>
            </button>
          );
        })}

        {sorted.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum pacote encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
