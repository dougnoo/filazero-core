/**
 * Case Service — Central case management.
 *
 * Provides a unified view of all cases across the platform.
 * Demo mode: returns mock data. Future: calls real API.
 */

import type { Case } from '@/domain/types/case';
import { CaseStatus } from '@/domain/enums/case-status';
import { RiskLevel } from '@/domain/enums/risk-level';
import { isTryaMockMode } from '@/lib/env';
import { mockCases } from '@/mock/cases-data';

// ─── Filters ───

export interface CaseFilters {
  status?: CaseStatus;
  riskLevel?: RiskLevel;
  reviewStatus?: 'pending' | 'in_progress' | 'completed';
  unitId?: string;
  search?: string;
}

// ─── Service Functions ───

/**
 * Fetch all cases with optional filtering.
 */
export async function getCases(filters?: CaseFilters): Promise<Case[]> {
  // Future: if (!isTryaMockMode()) { return realApi.getCases(filters); }

  await new Promise((r) => setTimeout(r, 300));

  let results = [...mockCases];

  if (filters?.status) {
    results = results.filter((c) => c.status === filters.status);
  }
  if (filters?.riskLevel) {
    results = results.filter((c) => c.riskLevel === filters.riskLevel);
  }
  if (filters?.reviewStatus) {
    results = results.filter((c) => c.reviewStatus === filters.reviewStatus);
  }
  if (filters?.unitId) {
    results = results.filter((c) => c.assignedUnitId === filters.unitId);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (c) =>
        c.patient.fullName.toLowerCase().includes(q) ||
        c.chiefComplaint.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }

  // Sort by priority (high first)
  results.sort((a, b) => b.priorityScore - a.priorityScore);

  return results;
}

/**
 * Fetch a single case by ID.
 */
export async function getCaseById(caseId: string): Promise<Case | null> {
  await new Promise((r) => setTimeout(r, 200));
  return mockCases.find((c) => c.id === caseId) ?? null;
}

/**
 * Get case counts by status (for dashboard/tabs).
 */
export async function getCaseCountsByStatus(): Promise<Record<CaseStatus, number>> {
  await new Promise((r) => setTimeout(r, 150));

  const counts = Object.fromEntries(
    Object.values(CaseStatus).map((s) => [s, 0]),
  ) as Record<CaseStatus, number>;

  mockCases.forEach((c) => {
    counts[c.status]++;
  });

  return counts;
}
