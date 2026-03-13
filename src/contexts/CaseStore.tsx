/**
 * CaseStore — Central mutable state for all cases in demo mode.
 *
 * Provides:
 * - cases: the complete list of cases
 * - mutations: approve, change priority, change status, etc.
 * - derived dashboard data computed from current case state
 *
 * All modules read from this store to maintain a single source of truth.
 */

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Case } from '@/domain/types/case';
import { CaseStatus, caseStatusConfig } from '@/domain/enums/case-status';
import { RiskLevel, riskLevelConfig } from '@/domain/enums/risk-level';
import { mockCases } from '@/mock/cases-data';
import { mockIntakesMap } from '@/mock/clinical-data';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';

// ─── Mutation types ───

export type CaseMutation =
  | { type: 'APPROVE_REVIEW'; caseId: string; reviewedBy: string }
  | { type: 'UPDATE_STATUS'; caseId: string; status: CaseStatus }
  | { type: 'UPDATE_PRIORITY'; caseId: string; priorityScore: number }
  | { type: 'UPDATE_DESTINATION'; caseId: string; destination: string }
  | { type: 'REQUEST_EXAMS'; caseId: string }
  | { type: 'MARK_REFERRED'; caseId: string; destination: string }
  | { type: 'MARK_COMPLETED'; caseId: string }
  | { type: 'MARK_CANCELLED'; caseId: string };

// ─── Derived dashboard data ───

export interface DerivedDashboardData {
  totalActive: number;
  totalCompleted: number;
  totalCancelled: number;
  byStatus: Record<CaseStatus, number>;
  byRisk: Record<RiskLevel, number>;
  byReviewStatus: Record<string, number>;
  pendingReviews: number;
  avgPriority: number;
  specialtyDistribution: Array<{ specialty: string; count: number }>;
  resolvedPrimaryRate: number;
  referralRate: number;
}

// ─── Context shape ───

interface CaseStoreContextValue {
  cases: Case[];
  getCase: (id: string) => Case | undefined;
  getCaseByJourneyId: (journeyId: string) => Case | undefined;
  getCaseByIntakeId: (intakeId: string) => Case | undefined;
  getIntakeForCase: (caseItem: Case) => ClinicalIntake | undefined;
  mutate: (mutation: CaseMutation) => void;
  dashboard: DerivedDashboardData;
}

const CaseStoreContext = createContext<CaseStoreContextValue | null>(null);

export function useCaseStore() {
  const ctx = useContext(CaseStoreContext);
  if (!ctx) throw new Error('useCaseStore must be used within CaseStoreProvider');
  return ctx;
}

// ─── Provider ───

export function CaseStoreProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<Case[]>(() => [...mockCases]);

  const getCase = useCallback(
    (id: string) => cases.find((c) => c.id === id),
    [cases],
  );

  const getCaseByJourneyId = useCallback(
    (journeyId: string) => cases.find((c) => c.journeyId === journeyId),
    [cases],
  );

  const getCaseByIntakeId = useCallback(
    (intakeId: string) => cases.find((c) => c.intakeId === intakeId),
    [cases],
  );

  const getIntakeForCase = useCallback(
    (caseItem: Case) => mockIntakesMap[caseItem.intakeId],
    [],
  );

  const mutate = useCallback((mutation: CaseMutation) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== mutation.caseId) return c;
        const now = new Date().toISOString();

        switch (mutation.type) {
          case 'APPROVE_REVIEW':
            return { ...c, reviewStatus: 'completed' as const, reviewedBy: mutation.reviewedBy, updatedAt: now };
          case 'UPDATE_STATUS':
            return {
              ...c,
              status: mutation.status,
              updatedAt: now,
              resolvedAt: mutation.status === CaseStatus.COMPLETED ? now : c.resolvedAt,
            };
          case 'UPDATE_PRIORITY':
            return { ...c, priorityScore: mutation.priorityScore, updatedAt: now };
          case 'UPDATE_DESTINATION':
            return { ...c, suggestedDestination: mutation.destination, updatedAt: now };
          case 'REQUEST_EXAMS':
            return { ...c, status: CaseStatus.EXAMS_REQUESTED, reviewStatus: 'in_progress' as const, updatedAt: now };
          case 'MARK_REFERRED':
            return { ...c, status: CaseStatus.REFERRED, suggestedDestination: mutation.destination, updatedAt: now };
          case 'MARK_COMPLETED':
            return { ...c, status: CaseStatus.COMPLETED, reviewStatus: 'completed' as const, resolvedAt: now, updatedAt: now };
          case 'MARK_CANCELLED':
            return { ...c, status: CaseStatus.CANCELLED, resolvedAt: now, updatedAt: now };
          default:
            return c;
        }
      }),
    );
  }, []);

  // ─── Derived dashboard ───

  const dashboard = useMemo<DerivedDashboardData>(() => {
    const terminalStatuses = new Set([CaseStatus.COMPLETED, CaseStatus.CANCELLED]);

    const byStatus = Object.fromEntries(
      Object.values(CaseStatus).map((s) => [s, 0]),
    ) as Record<CaseStatus, number>;

    const byRisk = Object.fromEntries(
      Object.values(RiskLevel).map((r) => [r, 0]),
    ) as Record<RiskLevel, number>;

    const byReviewStatus: Record<string, number> = { pending: 0, in_progress: 0, completed: 0 };
    const specialtyMap = new Map<string, number>();
    let totalPriority = 0;
    let resolvedPrimary = 0;
    let referredOut = 0;

    cases.forEach((c) => {
      byStatus[c.status]++;
      byRisk[c.riskLevel]++;
      byReviewStatus[c.reviewStatus]++;
      totalPriority += c.priorityScore;

      if (c.suggestedDestination) {
        specialtyMap.set(c.suggestedDestination, (specialtyMap.get(c.suggestedDestination) ?? 0) + 1);
      }

      if (c.status === CaseStatus.COMPLETED) {
        if (c.referralDecision === 'RESOLVE_PRIMARY') resolvedPrimary++;
        else referredOut++;
      }
    });

    const totalActive = cases.filter((c) => !terminalStatuses.has(c.status)).length;
    const totalResolved = resolvedPrimary + referredOut;

    return {
      totalActive,
      totalCompleted: byStatus[CaseStatus.COMPLETED],
      totalCancelled: byStatus[CaseStatus.CANCELLED],
      byStatus,
      byRisk,
      byReviewStatus,
      pendingReviews: byReviewStatus.pending,
      avgPriority: cases.length > 0 ? Math.round(totalPriority / cases.length) : 0,
      specialtyDistribution: [...specialtyMap.entries()]
        .map(([specialty, count]) => ({ specialty, count }))
        .sort((a, b) => b.count - a.count),
      resolvedPrimaryRate: totalResolved > 0 ? Math.round((resolvedPrimary / totalResolved) * 100) : 0,
      referralRate: totalResolved > 0 ? Math.round((referredOut / totalResolved) * 100) : 0,
    };
  }, [cases]);

  const value = useMemo(
    () => ({ cases, getCase, getCaseByJourneyId, getCaseByIntakeId, getIntakeForCase, mutate, dashboard }),
    [cases, getCase, getCaseByJourneyId, getCaseByIntakeId, getIntakeForCase, mutate, dashboard],
  );

  return (
    <CaseStoreContext.Provider value={value}>
      {children}
    </CaseStoreContext.Provider>
  );
}
