import { RiskLevel } from '../domain/enums/risk-level';
import { CareJourneyStatus } from '../domain/enums/care-journey-status';
import { CareStepStatus } from '../domain/enums/care-step-status';
import { ReferralUrgency } from '../domain/enums/referral-urgency';
import type { ClinicalIntake, ClinicalSummary, ExamSuggestion, ReferralRecommendation } from '../domain/types/clinical-intake';
import type { CareJourney, CareStep } from '../domain/types/care-journey';

const now = new Date().toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

// ─── Clinical Intake: completed case ───

export const mockClinicalSummary: ClinicalSummary = {
  id: 'cs-1',
  intakeId: 'ci-1',
  narrative:
    'Paciente feminina, 62 anos, hipertensa em uso de Losartana 50mg, apresenta dor torácica opressiva há 40 minutos com irradiação para membro superior esquerdo. Refere sudorese fria e dispneia aos mínimos esforços. Nega trauma ou esforço físico prévio. Última consulta cardiológica há 8 meses.',
  structuredFindings: [
    'Dor torácica opressiva com irradiação para MSE',
    'Sudorese fria',
    'Dispneia aos mínimos esforços',
    'Início há 40 minutos, sem fator desencadeante claro',
  ],
  suspectedConditions: [
    'Síndrome Coronariana Aguda',
    'Angina Instável',
    'Dissecção Aórtica (menos provável)',
  ],
  relevantHistory: 'HAS em tratamento. Sem DM conhecida. Sem internações recentes. Mãe faleceu de IAM aos 58 anos.',
  riskFactors: ['Hipertensão', 'Idade > 60', 'Histórico familiar de DAC', 'Sexo feminino pós-menopausa'],
  generatedAt: hoursAgo(1),
};

export const mockExamSuggestions: ExamSuggestion[] = [
  {
    id: 'ex-1',
    intakeId: 'ci-1',
    examName: 'ECG de 12 derivações',
    examCode: '02.11.02.003-6',
    category: 'FUNCTIONAL',
    priority: 'URGENT',
    justification: 'Dor torácica aguda com suspeita de SCA. ECG essencial para avaliação de isquemia/IAM.',
    status: 'REQUESTED',
  },
  {
    id: 'ex-2',
    intakeId: 'ci-1',
    examName: 'Troponina I',
    examCode: '02.02.01.069-2',
    category: 'LABORATORY',
    priority: 'URGENT',
    justification: 'Marcador de necrose miocárdica. Fundamental para diagnóstico de IAM.',
    status: 'SUGGESTED',
  },
  {
    id: 'ex-3',
    intakeId: 'ci-1',
    examName: 'Hemograma completo',
    examCode: '02.02.02.038-0',
    category: 'LABORATORY',
    priority: 'ROUTINE',
    justification: 'Avaliação basal. Excluir anemia como fator contribuinte da dispneia.',
    status: 'SUGGESTED',
  },
  {
    id: 'ex-4',
    intakeId: 'ci-1',
    examName: 'Raio-X de Tórax',
    examCode: '02.04.03.015-2',
    category: 'IMAGING',
    priority: 'URGENT',
    justification: 'Avaliação de área cardíaca, congestão pulmonar, e diagnósticos diferenciais.',
    status: 'SUGGESTED',
  },
];

export const mockReferralRecommendation: ReferralRecommendation = {
  id: 'rr-1',
  intakeId: 'ci-1',
  decision: 'REFER_EMERGENCY',
  confidence: 94,
  specialty: 'Cardiologia',
  justification:
    'Quadro clínico altamente sugestivo de Síndrome Coronariana Aguda. Paciente com fatores de risco cardiovascular significativos e apresentação clássica. Encaminhamento imediato para emergência cardiológica indicado. Não é caso para resolução em atenção primária.',
  requiredExamsBeforeReferral: ['ECG de 12 derivações'],
  alternativeActions: [],
  generatedAt: hoursAgo(1),
};

export const mockClinicalIntake: ClinicalIntake = {
  id: 'ci-1',
  citizenId: 'c-1',
  unitId: 'u-1',
  messages: [
    { id: 'm-1', role: 'assistant', content: 'Olá! Sou o assistente clínico do FilaZero. Vou coletar algumas informações sobre o que você está sentindo para agilizar seu atendimento. Qual é a sua queixa principal?', timestamp: hoursAgo(1.5) },
    { id: 'm-2', role: 'user', content: 'Estou com uma dor forte no peito há uns 40 minutos. Está apertando e vai pro braço esquerdo.', timestamp: hoursAgo(1.4) },
    { id: 'm-3', role: 'assistant', content: 'Entendo. Dor torácica com irradiação para o braço esquerdo é algo que precisamos avaliar com cuidado. Você está sentindo mais algum sintoma? Como falta de ar, suor frio, enjoo?', timestamp: hoursAgo(1.35) },
    { id: 'm-4', role: 'user', content: 'Sim, estou suando muito e com falta de ar.', timestamp: hoursAgo(1.3) },
    { id: 'm-5', role: 'assistant', content: 'Obrigado. Você toma algum medicamento regularmente? Tem alguma doença crônica como pressão alta ou diabetes?', timestamp: hoursAgo(1.25) },
    { id: 'm-6', role: 'user', content: 'Tomo Losartana 50mg pra pressão alta.', timestamp: hoursAgo(1.2) },
  ],
  chiefComplaint: 'Dor torácica opressiva com irradiação para MSE',
  symptoms: ['Dor torácica intensa', 'Falta de ar', 'Sudorese fria'],
  symptomDuration: '40 minutos',
  symptomOnset: 'Súbito, sem fator desencadeante',
  associatedSymptoms: ['Dispneia', 'Sudorese'],
  painScale: 8,
  currentMedications: ['Losartana 50mg'],
  allergies: [],
  chronicConditions: ['Hipertensão Arterial Sistêmica'],
  familyHistory: ['Mãe - IAM aos 58 anos'],
  riskLevel: RiskLevel.EMERGENCY,
  priorityScore: 95,
  clinicalSummary: mockClinicalSummary,
  examSuggestions: mockExamSuggestions,
  referralRecommendation: mockReferralRecommendation,
  isComplete: true,
  startedAt: hoursAgo(1.5),
  completedAt: hoursAgo(1),
};

// ─── Care Journeys ───

const emergencySteps: CareStep[] = [
  { id: 'cs-1-1', journeyId: 'cj-1', order: 1, type: 'INTAKE', label: 'Acolhimento', status: CareStepStatus.COMPLETED, startedAt: hoursAgo(1.5), completedAt: hoursAgo(1) },
  { id: 'cs-1-2', journeyId: 'cj-1', order: 2, type: 'TRIAGE', label: 'Triagem Clínica', status: CareStepStatus.COMPLETED, startedAt: hoursAgo(1), completedAt: hoursAgo(0.9) },
  { id: 'cs-1-3', journeyId: 'cj-1', order: 3, type: 'EXAM_REQUEST', label: 'ECG Solicitado', status: CareStepStatus.IN_PROGRESS, startedAt: hoursAgo(0.9) },
  { id: 'cs-1-4', journeyId: 'cj-1', order: 4, type: 'REFERRAL_DECISION', label: 'Encaminhamento Cardiologia', status: CareStepStatus.PENDING },
  { id: 'cs-1-5', journeyId: 'cj-1', order: 5, type: 'ATTENDANCE', label: 'Atendimento Emergência', status: CareStepStatus.PENDING },
];

const routineSteps: CareStep[] = [
  { id: 'cs-2-1', journeyId: 'cj-2', order: 1, type: 'INTAKE', label: 'Acolhimento', status: CareStepStatus.COMPLETED, startedAt: daysAgo(3), completedAt: daysAgo(3) },
  { id: 'cs-2-2', journeyId: 'cj-2', order: 2, type: 'TRIAGE', label: 'Triagem Clínica', status: CareStepStatus.COMPLETED, startedAt: daysAgo(3), completedAt: daysAgo(3) },
  { id: 'cs-2-3', journeyId: 'cj-2', order: 3, type: 'EXAM_REQUEST', label: 'Exames Laboratoriais', status: CareStepStatus.COMPLETED, startedAt: daysAgo(3), completedAt: daysAgo(1) },
  { id: 'cs-2-4', journeyId: 'cj-2', order: 4, type: 'EXAM_RESULT', label: 'Resultados Recebidos', status: CareStepStatus.COMPLETED, completedAt: daysAgo(1) },
  { id: 'cs-2-5', journeyId: 'cj-2', order: 5, type: 'REFERRAL_DECISION', label: 'Avaliação de Encaminhamento', status: CareStepStatus.IN_PROGRESS, startedAt: hoursAgo(2) },
  { id: 'cs-2-6', journeyId: 'cj-2', order: 6, type: 'ATTENDANCE', label: 'Consulta UBS', status: CareStepStatus.PENDING },
];

const resolvedSteps: CareStep[] = [
  { id: 'cs-3-1', journeyId: 'cj-3', order: 1, type: 'INTAKE', label: 'Acolhimento', status: CareStepStatus.COMPLETED, startedAt: daysAgo(7), completedAt: daysAgo(7) },
  { id: 'cs-3-2', journeyId: 'cj-3', order: 2, type: 'TRIAGE', label: 'Triagem Clínica', status: CareStepStatus.COMPLETED, startedAt: daysAgo(7), completedAt: daysAgo(7) },
  { id: 'cs-3-3', journeyId: 'cj-3', order: 3, type: 'ATTENDANCE', label: 'Consulta UBS', status: CareStepStatus.COMPLETED, startedAt: daysAgo(6), completedAt: daysAgo(6) },
  { id: 'cs-3-4', journeyId: 'cj-3', order: 4, type: 'FOLLOW_UP', label: 'Retorno Agendado', status: CareStepStatus.COMPLETED, completedAt: daysAgo(1) },
];

export const mockCareJourneys: CareJourney[] = [
  {
    id: 'cj-1',
    citizenId: 'c-1',
    citizenName: 'Maria da Silva Santos',
    intakeId: 'ci-1',
    originUnitId: 'u-1',
    chiefComplaint: 'Dor torácica opressiva com irradiação para MSE',
    riskLevel: RiskLevel.EMERGENCY,
    priorityScore: 95,
    referralUrgency: ReferralUrgency.IMMEDIATE,
    targetSpecialty: 'Cardiologia',
    status: CareJourneyStatus.EXAMS_PENDING,
    steps: emergencySteps,
    currentStepIndex: 2,
    startedAt: hoursAgo(1.5),
  },
  {
    id: 'cj-2',
    citizenId: 'c-2',
    citizenName: 'João Pedro Oliveira',
    intakeId: 'ci-2',
    originUnitId: 'u-1',
    chiefComplaint: 'Cefaleia recorrente há 2 semanas com alteração visual',
    riskLevel: RiskLevel.URGENT,
    priorityScore: 65,
    referralUrgency: ReferralUrgency.PRIORITY,
    targetSpecialty: 'Neurologia',
    status: CareJourneyStatus.REFERRAL_PENDING,
    steps: routineSteps,
    currentStepIndex: 4,
    startedAt: daysAgo(3),
  },
  {
    id: 'cj-3',
    citizenId: 'c-3',
    citizenName: 'Ana Beatriz Ferreira',
    intakeId: 'ci-3',
    originUnitId: 'u-1',
    chiefComplaint: 'Infecção urinária recorrente',
    riskLevel: RiskLevel.LESS_URGENT,
    priorityScore: 35,
    status: CareJourneyStatus.RESOLVED,
    steps: resolvedSteps,
    currentStepIndex: 3,
    startedAt: daysAgo(7),
    resolvedAt: daysAgo(1),
    resolution: 'RESOLVED_PRIMARY',
  },
  {
    id: 'cj-4',
    citizenId: 'c-4',
    citizenName: 'Carlos Eduardo Lima',
    intakeId: 'ci-4',
    originUnitId: 'u-2',
    chiefComplaint: 'Lombalgia crônica sem melhora com tratamento clínico',
    riskLevel: RiskLevel.LESS_URGENT,
    priorityScore: 40,
    referralUrgency: ReferralUrgency.ROUTINE,
    targetSpecialty: 'Ortopedia',
    status: CareJourneyStatus.AWAITING_SPECIALIST,
    steps: [
      { id: 'cs-4-1', journeyId: 'cj-4', order: 1, type: 'INTAKE', label: 'Acolhimento', status: CareStepStatus.COMPLETED, startedAt: daysAgo(15), completedAt: daysAgo(15) },
      { id: 'cs-4-2', journeyId: 'cj-4', order: 2, type: 'TRIAGE', label: 'Triagem', status: CareStepStatus.COMPLETED, startedAt: daysAgo(15), completedAt: daysAgo(15) },
      { id: 'cs-4-3', journeyId: 'cj-4', order: 3, type: 'EXAM_REQUEST', label: 'RX Coluna Lombar', status: CareStepStatus.COMPLETED, startedAt: daysAgo(14), completedAt: daysAgo(10) },
      { id: 'cs-4-4', journeyId: 'cj-4', order: 4, type: 'REFERRAL_DECISION', label: 'Encaminhamento Ortopedia', status: CareStepStatus.COMPLETED, completedAt: daysAgo(8) },
      { id: 'cs-4-5', journeyId: 'cj-4', order: 5, type: 'REGULATION_QUEUE', label: 'Fila de Regulação', status: CareStepStatus.IN_PROGRESS, startedAt: daysAgo(8) },
      { id: 'cs-4-6', journeyId: 'cj-4', order: 6, type: 'SPECIALIST_PREPARATION', label: 'Preparo para Especialista', status: CareStepStatus.PENDING },
      { id: 'cs-4-7', journeyId: 'cj-4', order: 7, type: 'ATTENDANCE', label: 'Consulta Ortopedia', status: CareStepStatus.PENDING },
    ],
    currentStepIndex: 4,
    queuePositionId: 'qp-reg-1',
    estimatedWaitDays: 22,
    startedAt: daysAgo(15),
  },
  {
    id: 'cj-5',
    citizenId: 'c-5',
    citizenName: 'Francisca Souza Pereira',
    intakeId: 'ci-5',
    originUnitId: 'u-1',
    chiefComplaint: 'Tosse persistente há 3 semanas com perda de peso',
    riskLevel: RiskLevel.VERY_URGENT,
    priorityScore: 80,
    referralUrgency: ReferralUrgency.PRIORITY,
    targetSpecialty: 'Pneumologia',
    status: CareJourneyStatus.EXAMS_PENDING,
    steps: [
      { id: 'cs-5-1', journeyId: 'cj-5', order: 1, type: 'INTAKE', label: 'Acolhimento', status: CareStepStatus.COMPLETED, startedAt: daysAgo(2), completedAt: daysAgo(2) },
      { id: 'cs-5-2', journeyId: 'cj-5', order: 2, type: 'TRIAGE', label: 'Triagem', status: CareStepStatus.COMPLETED, startedAt: daysAgo(2), completedAt: daysAgo(2) },
      { id: 'cs-5-3', journeyId: 'cj-5', order: 3, type: 'EXAM_REQUEST', label: 'RX Tórax + Baciloscopia', status: CareStepStatus.IN_PROGRESS, startedAt: daysAgo(1) },
      { id: 'cs-5-4', journeyId: 'cj-5', order: 4, type: 'REFERRAL_DECISION', label: 'Avaliação Pneumologia', status: CareStepStatus.PENDING },
    ],
    currentStepIndex: 2,
    startedAt: daysAgo(2),
  },
];

// ─── Manager Dashboard: Clinical Flow Metrics ───

export const mockClinicalDashboardStats = {
  // Flow metrics (replaces queue-only metrics)
  totalActiveJourneys: 142,
  resolvedAtPrimaryRate: 68, // % resolved without referral
  referralRate: 32, // % that needed specialist
  avgTimeToResolutionDays: 4.2,

  // Intake metrics
  intakesToday: 23,
  intakesCompleted: 19,
  avgIntakeDurationMinutes: 8,

  // Exam metrics
  pendingExams: 34,
  examsCompletedToday: 12,
  avgExamTurnaroundDays: 2.8,

  // Referral metrics
  pendingReferrals: 18,
  scheduledReferrals: 27,
  avgReferralWaitDays: 15,

  // Risk distribution (kept from original)
  riskDistribution: {
    [RiskLevel.EMERGENCY]: 2,
    [RiskLevel.VERY_URGENT]: 8,
    [RiskLevel.URGENT]: 42,
    [RiskLevel.LESS_URGENT]: 61,
    [RiskLevel.NON_URGENT]: 29,
  },

  // Top referral specialties
  topSpecialties: [
    { specialty: 'Cardiologia', count: 12, avgWaitDays: 18 },
    { specialty: 'Ortopedia', count: 9, avgWaitDays: 25 },
    { specialty: 'Neurologia', count: 7, avgWaitDays: 22 },
    { specialty: 'Endocrinologia', count: 6, avgWaitDays: 30 },
    { specialty: 'Pneumologia', count: 5, avgWaitDays: 14 },
  ],

  // Active professionals
  activeProfessionals: 6,
  throughputPerHour: 8.5,
};
