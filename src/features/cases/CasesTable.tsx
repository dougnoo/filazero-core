/**
 * CasesTable — Central cases list component.
 *
 * Displays all cases with columns: ID, Patient, Status, Risk, Destination,
 * Unit, Review Status, Priority.
 */

import type { Case } from '@/domain/types/case';
import { caseStatusConfig } from '@/domain/enums/case-status';
import { riskLevelConfig } from '@/domain/enums/risk-level';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RiskBadge } from '@/features/shared/RiskBadge';

interface CasesTableProps {
  cases: Case[];
  onSelectCase?: (caseItem: Case) => void;
  selectedCaseId?: string;
}

function ReviewStatusBadge({ status }: { status: 'pending' | 'in_progress' | 'completed' }) {
  const config = {
    pending: { label: 'Pendente', variant: 'outline' as const },
    in_progress: { label: 'Em Revisão', variant: 'secondary' as const },
    completed: { label: 'Revisado', variant: 'default' as const },
  };
  const c = config[status];
  return <Badge variant={c.variant} className="text-[10px]">{c.label}</Badge>;
}

export function CasesTable({ cases, onSelectCase, selectedCaseId }: CasesTableProps) {
  return (
    <div className="overflow-auto rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Caso</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risco</TableHead>
            <TableHead className="hidden md:table-cell">Destino</TableHead>
            <TableHead className="hidden lg:table-cell">Unidade</TableHead>
            <TableHead>Revisão</TableHead>
            <TableHead className="text-right w-[80px]">Prioridade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => {
            const statusCfg = caseStatusConfig[c.status];
            return (
              <TableRow
                key={c.id}
                className={`cursor-pointer transition-colors ${selectedCaseId === c.id ? 'bg-accent' : 'hover:bg-muted/50'}`}
                onClick={() => onSelectCase?.(c)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {c.id.replace('case-', '#')}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{c.patient.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.chiefComplaint}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusCfg.variant} className="text-[10px] whitespace-nowrap">
                    {statusCfg.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <RiskBadge level={c.riskLevel} size="sm" />
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {c.suggestedDestination ?? '—'}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {c.assignedUnitName}
                </TableCell>
                <TableCell>
                  <ReviewStatusBadge status={c.reviewStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-display text-sm font-bold tabular-nums ${
                    c.priorityScore >= 80 ? 'text-destructive' :
                    c.priorityScore >= 50 ? 'text-secondary' : 'text-muted-foreground'
                  }`}>
                    {c.priorityScore}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
