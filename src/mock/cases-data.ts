/**
 * Mock Cases — Central case list linking all flows.
 *
 * Built from existing mock journeys and intakes for consistency.
 */

import type { Case, Patient } from '@/domain/types/case';
import { CaseStatus, journeyStatusToCaseStatus } from '@/domain/enums/case-status';
import { RiskLevel } from '@/domain/enums/risk-level';
import { mockCareJourneys, mockIntakesMap } from './clinical-data';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

// ─── Patients ───

export const mockPatients: Patient[] = [
  { id: 'c-1', fullName: 'Maria da Silva Santos', cpf: '123.456.789-00', birthDate: '1963-05-12', gender: 'F', chronicConditions: ['Hipertensão Arterial'] },
  { id: 'c-2', fullName: 'João Pedro Oliveira', cpf: '234.567.890-11', birthDate: '1991-08-20', gender: 'M' },
  { id: 'c-3', fullName: 'Ana Beatriz Ferreira', cpf: '345.678.901-22', birthDate: '1997-03-15', gender: 'F' },
  { id: 'c-4', fullName: 'Carlos Eduardo Lima', cpf: '456.789.012-33', birthDate: '1977-11-30', gender: 'M', chronicConditions: ['Obesidade grau I'] },
  { id: 'c-5', fullName: 'Francisca Souza Pereira', cpf: '567.890.123-44', birthDate: '1970-07-08', gender: 'F' },
  { id: 'c-6', fullName: 'Roberto Nascimento', cpf: '678.901.234-55', birthDate: '1967-12-25', gender: 'M', chronicConditions: ['Diabetes tipo 2', 'Hipertensão'] },
  { id: 'c-7', fullName: 'Dona Tereza Almeida', cpf: '789.012.345-66', birthDate: '1958-02-14', gender: 'F' },
  // Additional demo scenario patients
  { id: 'c-8', fullName: 'Lucas Martins Costa', cpf: '890.123.456-77', birthDate: '2002-09-05', gender: 'M' },
  { id: 'c-9', fullName: 'Sandra Regina Dias', cpf: '901.234.567-88', birthDate: '1985-04-18', gender: 'F', chronicConditions: ['Asma'] },
  { id: 'c-10', fullName: 'José Antônio Ribeiro', cpf: '012.345.678-99', birthDate: '1950-01-22', gender: 'M', chronicConditions: ['DPOC', 'Cardiopatia'] },
];

const patientsMap: Record<string, Patient> = Object.fromEntries(mockPatients.map((p) => [p.id, p]));

const unitNames: Record<string, string> = {
  'u-1': 'UBS Vila Esperança',
  'u-2': 'UBS Jardim Primavera',
};

// ─── Build cases from existing journeys + intakes ───

export const mockCases: Case[] = mockCareJourneys.map((journey) => {
  const intake = mockIntakesMap[journey.intakeId];
  const patient = patientsMap[journey.citizenId] ?? { id: journey.citizenId, fullName: journey.citizenName };
  const status = journeyStatusToCaseStatus(journey.status);

  const reviewStatusMap: Record<CaseStatus, 'pending' | 'in_progress' | 'completed'> = {
    [CaseStatus.STARTED]: 'pending',
    [CaseStatus.IN_TRIAGE]: 'pending',
    [CaseStatus.AWAITING_REVIEW]: 'pending',
    [CaseStatus.REVIEWED]: 'completed',
    [CaseStatus.EXAMS_REQUESTED]: 'in_progress',
    [CaseStatus.EXAMS_COMPLETED]: 'in_progress',
    [CaseStatus.REFERRED]: 'completed',
    [CaseStatus.SCHEDULED]: 'completed',
    [CaseStatus.IN_ATTENDANCE]: 'completed',
    [CaseStatus.COMPLETED]: 'completed',
    [CaseStatus.CANCELLED]: 'completed',
  };

  return {
    id: `case-${journey.id}`,
    patient,
    status,
    riskLevel: journey.riskLevel,
    priorityScore: journey.priorityScore,
    chiefComplaint: journey.chiefComplaint,
    suggestedDestination: journey.targetSpecialty,
    assignedUnitId: journey.originUnitId,
    assignedUnitName: unitNames[journey.originUnitId] ?? 'UBS',
    reviewedBy: status === CaseStatus.COMPLETED || status === CaseStatus.REFERRED ? 'Dr. Carlos Mendes' : undefined,
    reviewStatus: reviewStatusMap[status],
    referralDecision: intake?.referralRecommendation?.decision,
    aiConfidence: intake?.referralRecommendation?.confidence,
    intakeId: journey.intakeId,
    journeyId: journey.id,
    createdAt: journey.startedAt,
    updatedAt: journey.resolvedAt ?? new Date().toISOString(),
    resolvedAt: journey.resolvedAt,
  };
});
