/**
 * Intake Service — Abstraction layer for Clinical Intake interactions.
 * 
 * Currently uses mock data. Designed to be replaced by:
 * - chat-agents (Python/LangChain AI agents via AWS Bedrock)
 * - chat-backend (WebSocket/REST conversation management)
 * - trya-backend (persistence, patient records)
 * 
 * Contract matches the existing multi-agent architecture:
 * 1. Onboarding Agent → collects demographics, history
 * 2. Symptoms Agent → adaptive symptom collection
 * 3. Structuring Agent → generates ClinicalSummary
 * 4. Exam Suggestion Agent → suggests pre-consultation exams
 * 5. Referral Advisor Agent → recommends routing decision
 */

import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { TriageMessage } from '@/domain/types/triage';
import { RiskLevel } from '@/domain/enums/risk-level';

// ─── Intake Phases ───
export type IntakePhase =
  | 'GREETING'
  | 'CHIEF_COMPLAINT'
  | 'SYMPTOM_DETAILS'
  | 'MEDICAL_HISTORY'
  | 'MEDICATIONS'
  | 'ALLERGIES'
  | 'SOCIAL_CONTEXT'
  | 'DOCUMENTS'
  | 'PROCESSING'
  | 'COMPLETE';

export const PHASE_ORDER: IntakePhase[] = [
  'GREETING',
  'CHIEF_COMPLAINT',
  'SYMPTOM_DETAILS',
  'MEDICAL_HISTORY',
  'MEDICATIONS',
  'ALLERGIES',
  'SOCIAL_CONTEXT',
  'DOCUMENTS',
  'PROCESSING',
  'COMPLETE',
];

export const PHASE_LABELS: Record<IntakePhase, string> = {
  GREETING: 'Boas-vindas',
  CHIEF_COMPLAINT: 'Queixa principal',
  SYMPTOM_DETAILS: 'Detalhes dos sintomas',
  MEDICAL_HISTORY: 'Histórico de saúde',
  MEDICATIONS: 'Medicamentos',
  ALLERGIES: 'Alergias',
  SOCIAL_CONTEXT: 'Contexto social',
  DOCUMENTS: 'Documentos',
  PROCESSING: 'Processando',
  COMPLETE: 'Concluído',
};

// ─── Mock Agent Responses ───
// Simulates the adaptive question flow from the multi-agent system.

const AGENT_RESPONSES: Record<IntakePhase, string> = {
  GREETING:
    'Olá! Sou o assistente clínico do FilaZero. Vou fazer algumas perguntas para entender melhor o que você está sentindo e agilizar seu atendimento. Tudo que você compartilhar é confidencial e será usado apenas pela equipe de saúde.\n\nQual é a sua queixa principal hoje? O que trouxe você à unidade de saúde?',
  CHIEF_COMPLAINT:
    'Entendi. Vou precisar de mais alguns detalhes sobre esses sintomas.\n\nHá quanto tempo você está sentindo isso? Os sintomas são constantes ou vêm e vão? De 0 a 10, qual a intensidade do desconforto?',
  SYMPTOM_DETAILS:
    'Obrigado pelas informações. Agora preciso saber um pouco sobre seu histórico de saúde.\n\nVocê tem alguma doença crônica (pressão alta, diabetes, asma, etc.)? Já foi internado(a) recentemente? Tem histórico familiar de doenças importantes?',
  MEDICAL_HISTORY:
    'Certo. Sobre medicamentos:\n\nVocê toma algum medicamento regularmente? Se sim, quais e em que dose?',
  MEDICATIONS:
    'E sobre alergias:\n\nVocê tem alergia a algum medicamento, alimento ou substância?',
  ALLERGIES:
    'Quase finalizando. Algumas informações do seu contexto ajudam a equipe a cuidar melhor de você.\n\nComo você avalia suas condições de moradia? Tem acesso a saneamento básico? Essas informações são opcionais.',
  SOCIAL_CONTEXT:
    'Se você tiver algum documento médico recente (exames, receitas, laudos), pode anexar aqui. Isso é opcional, mas ajuda na avaliação.\n\nSe não tiver, pode pular esta etapa.',
  DOCUMENTS:
    'Obrigado por compartilhar todas essas informações. Estou processando seus dados com nossa inteligência clínica para gerar um resumo, sugestão de exames e recomendação de encaminhamento.\n\nIsso levará alguns segundos...',
  PROCESSING: '',
  COMPLETE: '',
};

function getNextPhase(current: IntakePhase): IntakePhase {
  const idx = PHASE_ORDER.indexOf(current);
  if (idx < 0 || idx >= PHASE_ORDER.length - 1) return 'COMPLETE';
  return PHASE_ORDER[idx + 1];
}

let msgCounter = 100;
function makeMsg(role: 'user' | 'assistant', content: string): TriageMessage {
  msgCounter++;
  return {
    id: `im-${msgCounter}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sends a user message and returns the AI agent's response + next phase.
 * In production, this calls chat-backend → chat-agents pipeline.
 */
export async function sendIntakeMessage(
  _intakeId: string,
  userMessage: string,
  currentPhase: IntakePhase,
): Promise<{ reply: TriageMessage; nextPhase: IntakePhase }> {
  // Simulate network latency (agent thinking time)
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

  const nextPhase = getNextPhase(currentPhase);
  const replyContent = AGENT_RESPONSES[nextPhase] || 'Obrigado. Processando...';

  return {
    reply: makeMsg('assistant', replyContent),
    nextPhase,
  };
}

/**
 * Generates the final clinical intake result.
 * In production, this calls the Structuring Agent + Exam Suggestion Agent + Referral Advisor.
 */
export async function generateIntakeResult(
  _intakeId: string,
  messages: TriageMessage[],
): Promise<ClinicalIntake> {
  // Simulate AI processing time
  await new Promise((r) => setTimeout(r, 2000));

  // Return mock structured result (mirrors mock-clinical-data patterns)
  const now = new Date().toISOString();
  return {
    id: _intakeId,
    citizenId: 'c-current',
    unitId: 'u-1',
    messages,
    chiefComplaint: 'Dor de cabeça persistente há 5 dias com tontura',
    symptoms: ['Cefaleia persistente', 'Tontura', 'Visão turva ocasional'],
    symptomDuration: '5 dias',
    symptomOnset: 'Gradual',
    associatedSymptoms: ['Tontura', 'Visão turva', 'Náusea leve'],
    painScale: 6,
    currentMedications: ['Losartana 50mg'],
    allergies: ['Dipirona'],
    chronicConditions: ['Hipertensão Arterial Sistêmica'],
    familyHistory: ['Pai - AVC aos 65 anos'],
    riskLevel: RiskLevel.URGENT,
    priorityScore: 65,
    clinicalSummary: {
      id: 'cs-new',
      intakeId: _intakeId,
      narrative:
        'Paciente hipertenso(a), em uso de Losartana 50mg, apresenta cefaleia persistente há 5 dias com piora progressiva, acompanhada de tontura e episódios de visão turva. Refere náusea leve associada. Histórico familiar de AVC paterno. Quadro sugere necessidade de avaliação neurológica e controle pressórico.',
      structuredFindings: [
        'Cefaleia persistente há 5 dias com piora progressiva',
        'Tontura e episódios de visão turva associados',
        'Paciente hipertenso em tratamento',
        'Histórico familiar de AVC',
      ],
      suspectedConditions: [
        'Crise hipertensiva',
        'Cefaleia tensional crônica',
        'Enxaqueca com aura',
        'Causa secundária (investigar)',
      ],
      relevantHistory:
        'HAS em tratamento com Losartana 50mg. Pai teve AVC aos 65 anos. Alergia a dipirona.',
      riskFactors: [
        'Hipertensão arterial',
        'Histórico familiar de AVC',
        'Cefaleia com sinais de alarme (visão turva)',
      ],
      generatedAt: now,
    },
    examSuggestions: [
      {
        id: 'ex-n1',
        intakeId: _intakeId,
        examName: 'Aferição de Pressão Arterial (MAPA 24h)',
        category: 'FUNCTIONAL',
        priority: 'URGENT',
        justification:
          'Paciente hipertenso com cefaleia persistente. Necessário avaliar controle pressórico e picos.',
        status: 'SUGGESTED',
      },
      {
        id: 'ex-n2',
        intakeId: _intakeId,
        examName: 'Hemograma completo',
        examCode: '02.02.02.038-0',
        category: 'LABORATORY',
        priority: 'ROUTINE',
        justification: 'Avaliação basal para descartar causas secundárias.',
        status: 'SUGGESTED',
      },
      {
        id: 'ex-n3',
        intakeId: _intakeId,
        examName: 'Tomografia de Crânio',
        category: 'IMAGING',
        priority: 'URGENT',
        justification:
          'Cefaleia com sinais de alarme (visão turva, tontura) em paciente hipertenso com HF de AVC. Necessário descartar causa estrutural.',
        status: 'SUGGESTED',
      },
    ],
    referralRecommendation: {
      id: 'rr-new',
      intakeId: _intakeId,
      decision: 'REFER_SPECIALIST',
      confidence: 78,
      specialty: 'Neurologia',
      justification:
        'Cefaleia persistente com sinais de alarme em paciente hipertenso com histórico familiar de AVC. Recomenda-se avaliação neurológica após exames iniciais. Manter acompanhamento pressórico na UBS.',
      requiredExamsBeforeReferral: [
        'MAPA 24h',
        'Tomografia de Crânio',
      ],
      alternativeActions: [
        'Ajuste de anti-hipertensivo na UBS',
        'Orientação sobre sinais de alarme',
        'Retorno em 48h se piora',
      ],
      generatedAt: now,
    },
    isComplete: true,
    startedAt: new Date(Date.now() - 600000).toISOString(),
    completedAt: now,
  };
}

/**
 * Returns the initial greeting message to start the intake.
 */
export function getGreetingMessage(): TriageMessage {
  return makeMsg('assistant', AGENT_RESPONSES.GREETING);
}
