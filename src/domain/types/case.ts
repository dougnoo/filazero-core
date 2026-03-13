/**
 * Case — The central entity that ties together all clinical modules.
 *
 * A Case represents a single patient encounter from intake to resolution.
 * It references: Patient, Intake, Clinical Result, Journey, Review, Referral.
 *
 * This is the unified view used by the Cases module to link all flows.
 */

import { RiskLevel } from '../enums/risk-level';
import { CaseStatus } from '../enums/case-status';

export interface Patient {
  id: string;
  fullName: string;
  cpf?: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'OTHER';
  phone?: string;
  chronicConditions?: string[];
}

export interface Case {
  id: string;
  /** Patient associated with this case */
  patient: Patient;
  /** Current unified status */
  status: CaseStatus;
  /** Manchester protocol risk classification */
  riskLevel: RiskLevel;
  /** Priority score 0-100 (higher = more urgent) */
  priorityScore: number;
  /** Chief complaint text */
  chiefComplaint: string;
  /** Target specialty if referral is needed */
  suggestedDestination?: string;
  /** Health unit where the case was created */
  assignedUnitId: string;
  /** Health unit name (denormalized for display) */
  assignedUnitName: string;
  /** Professional assigned for review */
  reviewedBy?: string;
  /** Whether clinical review is complete */
  reviewStatus: 'pending' | 'in_progress' | 'completed';
  /** Referral decision */
  referralDecision?: 'RESOLVE_PRIMARY' | 'REFER_SPECIALIST' | 'REFER_EMERGENCY' | 'NEEDS_MORE_DATA';
  /** AI confidence in recommendation (0-100) */
  aiConfidence?: number;

  // ─── Linked entity IDs ───
  intakeId: string;
  journeyId: string;

  // ─── Timestamps ───
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
