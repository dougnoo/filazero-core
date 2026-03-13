/**
 * Intake Service — Clinical Intake interactions.
 *
 * DEMO_MODE / isChatMockMode(): Uses a scripted mock conversation that
 * simulates the Trya multi-agent flow (Onboarding → Symptoms → Result).
 *
 * Real mode: Calls clinical-chat / clinical-result edge functions.
 */

import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { TriageMessage } from '@/domain/types/triage';
import { RiskLevel } from '@/domain/enums/risk-level';
import { isChatMockMode } from '@/lib/env';
import { mockClinicalIntake } from '@/mock';

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

// ═══════════════════════════════════════════════════════════════════
// MOCK CONVERSATION FLOW (Demo Mode)
// Simulates the Trya multi-agent conversational intake
// ═══════════════════════════════════════════════════════════════════

const MOCK_RESPONSES: Array<{ response: string; nextPhase: IntakePhase }> = [
  {
    response: 'Entendi. Me conta um pouco mais sobre isso — há quanto tempo você está sentindo esses sintomas? Eles começaram de repente ou foram aparecendo aos poucos?',
    nextPhase: 'SYMPTOM_DETAILS',
  },
  {
    response: 'Obrigado por me contar. Numa escala de 0 a 10, como você classificaria a intensidade do que está sentindo? E esses sintomas estão piorando, melhorando ou se mantendo estáveis?',
    nextPhase: 'SYMPTOM_DETAILS',
  },
  {
    response: 'Compreendo. Agora preciso saber um pouco sobre seu histórico de saúde. Você tem alguma condição crônica, como diabetes, hipertensão ou asma?',
    nextPhase: 'MEDICAL_HISTORY',
  },
  {
    response: 'Certo. E quanto a medicamentos — você toma algum remédio regularmente? Pode me dizer o nome e a dosagem, se souber.',
    nextPhase: 'MEDICATIONS',
  },
  {
    response: 'Bom saber. E você tem alergia a algum medicamento, alimento ou substância?',
    nextPhase: 'ALLERGIES',
  },
  {
    response: 'Obrigado por compartilhar todas essas informações. Vou processar seus dados agora com nossa inteligência clínica para gerar um resumo completo para a equipe médica. Isso pode levar alguns instantes.',
    nextPhase: 'PROCESSING',
  },
];

let mockTurnIndex = new Map<string, number>();

async function sendMockMessage(
  intakeId: string,
  _userMessage: string,
  _currentPhase: IntakePhase,
): Promise<{ reply: TriageMessage; nextPhase: IntakePhase }> {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

  const idx = mockTurnIndex.get(intakeId) ?? 0;
  const step = MOCK_RESPONSES[Math.min(idx, MOCK_RESPONSES.length - 1)];
  mockTurnIndex.set(intakeId, idx + 1);

  return {
    reply: makeMsg('assistant', step.response),
    nextPhase: step.nextPhase,
  };
}

async function generateMockResult(intakeId: string, messages: TriageMessage[]): Promise<ClinicalIntake> {
  await new Promise((r) => setTimeout(r, 1500));
  mockTurnIndex.delete(intakeId);

  return {
    ...mockClinicalIntake,
    id: intakeId,
    messages,
    startedAt: messages[0]?.timestamp ?? new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════
// REAL AI CONVERSATION (Edge Functions)
// ═══════════════════════════════════════════════════════════════════

const COMPLETION_SIGNALS = [
  'vou processar',
  'processar seus dados',
  'processando',
  'informações suficientes',
  'dados suficientes',
  'inteligência clínica',
];

function detectPhaseFromResponse(
  response: string,
  _currentPhase: IntakePhase,
  messageCount: number,
): IntakePhase {
  const lower = response.toLowerCase();
  if (COMPLETION_SIGNALS.some((s) => lower.includes(s))) return 'PROCESSING';
  if (messageCount <= 2) return 'CHIEF_COMPLAINT';
  if (messageCount <= 4) return 'SYMPTOM_DETAILS';
  if (messageCount <= 6) return 'MEDICAL_HISTORY';
  if (messageCount <= 8) return 'MEDICATIONS';
  if (messageCount <= 10) return 'ALLERGIES';
  if (messageCount <= 12) return 'SOCIAL_CONTEXT';
  return 'DOCUMENTS';
}

const sessionHistory = new Map<string, Array<{ role: string; content: string }>>();

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clinical-chat`;
const RESULT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clinical-result`;

async function sendRealMessage(
  intakeId: string,
  userMessage: string,
  currentPhase: IntakePhase,
): Promise<{ reply: TriageMessage; nextPhase: IntakePhase }> {
  if (!sessionHistory.has(intakeId)) sessionHistory.set(intakeId, []);
  const history = sessionHistory.get(intakeId)!;
  history.push({ role: 'user', content: userMessage });

  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: history }),
    });

    if (!resp.ok || !resp.body) throw new Error(`Chat request failed: ${resp.status}`);

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let fullResponse = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) fullResponse += content;
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    if (!fullResponse) throw new Error('Empty response from AI');

    history.push({ role: 'assistant', content: fullResponse });
    const nextPhase = detectPhaseFromResponse(fullResponse, currentPhase, history.length);

    return { reply: makeMsg('assistant', fullResponse), nextPhase };
  } catch (error) {
    console.error('[intake-service] Error:', error);
    return {
      reply: makeMsg('assistant', 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?'),
      nextPhase: currentPhase,
    };
  }
}

async function generateRealResult(intakeId: string, messages: TriageMessage[]): Promise<ClinicalIntake> {
  const history = sessionHistory.get(intakeId) ?? messages.map((m) => ({ role: m.role, content: m.content }));

  const resp = await fetch(RESULT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: history }),
  });

  if (!resp.ok) throw new Error(`Result generation failed: ${resp.status}`);
  const data = await resp.json();
  const now = new Date().toISOString();

  const riskLevelMap: Record<string, RiskLevel> = {
    EMERGENCY: RiskLevel.EMERGENCY,
    VERY_URGENT: RiskLevel.VERY_URGENT,
    URGENT: RiskLevel.URGENT,
    LESS_URGENT: RiskLevel.LESS_URGENT,
    NON_URGENT: RiskLevel.NON_URGENT,
  };

  sessionHistory.delete(intakeId);

  return {
    id: intakeId,
    citizenId: 'c-current',
    unitId: 'u-1',
    messages,
    chiefComplaint: data.chiefComplaint || 'Não informado',
    symptoms: data.symptoms || [],
    symptomDuration: data.symptomDuration,
    painScale: data.painScale,
    currentMedications: data.currentMedications || [],
    allergies: data.allergies || [],
    chronicConditions: data.chronicConditions || [],
    familyHistory: data.familyHistory || [],
    riskLevel: riskLevelMap[data.riskLevel] || RiskLevel.LESS_URGENT,
    priorityScore: data.priorityScore || 50,
    clinicalSummary: {
      id: `cs-${intakeId}`, intakeId,
      narrative: data.clinicalSummary?.narrative || '',
      structuredFindings: data.clinicalSummary?.structuredFindings || [],
      suspectedConditions: data.clinicalSummary?.suspectedConditions || [],
      relevantHistory: data.clinicalSummary?.relevantHistory || '',
      riskFactors: data.clinicalSummary?.riskFactors || [],
      generatedAt: now,
    },
    examSuggestions: (data.examSuggestions || []).map((e: any, i: number) => ({
      id: `ex-${i}`, intakeId,
      examName: e.examName, examCode: e.examCode,
      category: e.category || 'OTHER', priority: e.priority || 'ROUTINE',
      justification: e.justification || '', status: 'SUGGESTED' as const,
    })),
    referralRecommendation: {
      id: `rr-${intakeId}`, intakeId,
      decision: data.referralRecommendation?.decision || 'NEEDS_MORE_DATA',
      confidence: data.referralRecommendation?.confidence || 50,
      specialty: data.referralRecommendation?.specialty,
      justification: data.referralRecommendation?.justification || '',
      requiredExamsBeforeReferral: data.referralRecommendation?.requiredExamsBeforeReferral || [],
      alternativeActions: data.referralRecommendation?.alternativeActions || [],
      generatedAt: now,
    },
    isComplete: true,
    startedAt: messages[0]?.timestamp ?? now,
    completedAt: now,
  };
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API — automatically picks mock vs real
// ═══════════════════════════════════════════════════════════════════

export async function sendIntakeMessage(
  intakeId: string,
  userMessage: string,
  currentPhase: IntakePhase,
): Promise<{ reply: TriageMessage; nextPhase: IntakePhase }> {
  if (isChatMockMode()) {
    return sendMockMessage(intakeId, userMessage, currentPhase);
  }
  return sendRealMessage(intakeId, userMessage, currentPhase);
}

export async function generateIntakeResult(
  intakeId: string,
  messages: TriageMessage[],
): Promise<ClinicalIntake> {
  if (isChatMockMode()) {
    return generateMockResult(intakeId, messages);
  }
  return generateRealResult(intakeId, messages);
}

export function getGreetingMessage(): TriageMessage {
  return makeMsg(
    'assistant',
    'Olá! Sou o assistente clínico do FilaZero. Vou fazer algumas perguntas para entender melhor o que você está sentindo e agilizar seu atendimento. Tudo que você compartilhar é confidencial e será usado apenas pela equipe de saúde.\n\nQual é a sua queixa principal hoje? O que trouxe você à unidade de saúde?',
  );
}
