/**
 * Intake Service — Clinical Intake AI interactions.
 * 
 * Uses Lovable AI Gateway via edge functions:
 * - clinical-chat: Streaming conversational agent (Manchester Protocol)
 * - clinical-result: Structured clinical data extraction via tool calling
 * 
 * Architecture mirrors the original Trya chat-agents:
 * 1. Onboarding Agent → collects demographics, history
 * 2. Symptoms Agent → adaptive symptom collection
 * 3. Structuring Agent → generates ClinicalSummary
 * 4. Exam Suggestion Agent → suggests pre-consultation exams
 * 5. Referral Advisor Agent → recommends routing decision
 */

import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { TriageMessage } from '@/domain/types/triage';
import { RiskLevel } from '@/domain/enums/risk-level';
import { supabase } from '@/integrations/supabase/client';

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

// ─── Phase detection from AI response ───
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
  currentPhase: IntakePhase,
  messageCount: number,
): IntakePhase {
  const lower = response.toLowerCase();

  // Check if AI signals completion
  if (COMPLETION_SIGNALS.some((s) => lower.includes(s))) {
    return 'PROCESSING';
  }

  // Heuristic phase progression based on message count
  // The AI drives the conversation, we just track progress
  if (messageCount <= 2) return 'CHIEF_COMPLAINT';
  if (messageCount <= 4) return 'SYMPTOM_DETAILS';
  if (messageCount <= 6) return 'MEDICAL_HISTORY';
  if (messageCount <= 8) return 'MEDICATIONS';
  if (messageCount <= 10) return 'ALLERGIES';
  if (messageCount <= 12) return 'SOCIAL_CONTEXT';
  return 'DOCUMENTS';
}

// Store conversation history per session for the LLM
const sessionHistory = new Map<string, Array<{ role: string; content: string }>>();

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clinical-chat`;
const RESULT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clinical-result`;

/**
 * Sends a user message to the clinical AI agent and streams the response.
 * Uses the clinical-chat edge function (Lovable AI Gateway).
 */
export async function sendIntakeMessage(
  intakeId: string,
  userMessage: string,
  currentPhase: IntakePhase,
): Promise<{ reply: TriageMessage; nextPhase: IntakePhase }> {
  // Get or create session history
  if (!sessionHistory.has(intakeId)) {
    sessionHistory.set(intakeId, []);
  }
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

    if (!resp.ok || !resp.body) {
      const errorBody = await resp.text();
      console.error('[intake-service] Chat error:', resp.status, errorBody);
      throw new Error(`Chat request failed: ${resp.status}`);
    }

    // Parse SSE stream
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
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

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

    // Flush remaining
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) fullResponse += content;
        } catch { /* ignore */ }
      }
    }

    if (!fullResponse) {
      throw new Error('Empty response from AI');
    }

    // Store assistant response in history
    history.push({ role: 'assistant', content: fullResponse });

    const nextPhase = detectPhaseFromResponse(fullResponse, currentPhase, history.length);

    return {
      reply: makeMsg('assistant', fullResponse),
      nextPhase,
    };
  } catch (error) {
    console.error('[intake-service] Error:', error);
    // Fallback: return a generic error message
    const fallback = makeMsg(
      'assistant',
      'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?',
    );
    return { reply: fallback, nextPhase: currentPhase };
  }
}

/**
 * Generates the final structured clinical intake result using AI.
 * Calls the clinical-result edge function (tool calling for structured output).
 */
export async function generateIntakeResult(
  intakeId: string,
  messages: TriageMessage[],
): Promise<ClinicalIntake> {
  const history = sessionHistory.get(intakeId) ??
    messages.map((m) => ({ role: m.role, content: m.content }));

  try {
    const resp = await fetch(RESULT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: history }),
    });

    if (!resp.ok) {
      const errorBody = await resp.text();
      console.error('[intake-service] Result generation error:', resp.status, errorBody);
      throw new Error(`Result generation failed: ${resp.status}`);
    }

    const data = await resp.json();
    const now = new Date().toISOString();

    // Map risk level string to enum
    const riskLevelMap: Record<string, RiskLevel> = {
      EMERGENCY: RiskLevel.EMERGENCY,
      VERY_URGENT: RiskLevel.VERY_URGENT,
      URGENT: RiskLevel.URGENT,
      LESS_URGENT: RiskLevel.LESS_URGENT,
      NON_URGENT: RiskLevel.NON_URGENT,
    };

    const result: ClinicalIntake = {
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
        id: `cs-${intakeId}`,
        intakeId,
        narrative: data.clinicalSummary?.narrative || '',
        structuredFindings: data.clinicalSummary?.structuredFindings || [],
        suspectedConditions: data.clinicalSummary?.suspectedConditions || [],
        relevantHistory: data.clinicalSummary?.relevantHistory || '',
        riskFactors: data.clinicalSummary?.riskFactors || [],
        generatedAt: now,
      },
      examSuggestions: (data.examSuggestions || []).map(
        (e: any, i: number) => ({
          id: `ex-${i}`,
          intakeId,
          examName: e.examName,
          examCode: e.examCode,
          category: e.category || 'OTHER',
          priority: e.priority || 'ROUTINE',
          justification: e.justification || '',
          status: 'SUGGESTED' as const,
        }),
      ),
      referralRecommendation: {
        id: `rr-${intakeId}`,
        intakeId,
        decision: data.referralRecommendation?.decision || 'NEEDS_MORE_DATA',
        confidence: data.referralRecommendation?.confidence || 50,
        specialty: data.referralRecommendation?.specialty,
        justification: data.referralRecommendation?.justification || '',
        requiredExamsBeforeReferral:
          data.referralRecommendation?.requiredExamsBeforeReferral || [],
        alternativeActions:
          data.referralRecommendation?.alternativeActions || [],
        generatedAt: now,
      },
      isComplete: true,
      startedAt: messages[0]?.timestamp ?? now,
      completedAt: now,
    };

    // Clean up session history
    sessionHistory.delete(intakeId);

    return result;
  } catch (error) {
    console.error('[intake-service] Result generation error:', error);
    // Clean up
    sessionHistory.delete(intakeId);
    throw error;
  }
}

/**
 * Returns the initial greeting message to start the intake.
 */
export function getGreetingMessage(): TriageMessage {
  return makeMsg(
    'assistant',
    'Olá! Sou o assistente clínico do FilaZero. Vou fazer algumas perguntas para entender melhor o que você está sentindo e agilizar seu atendimento. Tudo que você compartilhar é confidencial e será usado apenas pela equipe de saúde.\n\nQual é a sua queixa principal hoje? O que trouxe você à unidade de saúde?',
  );
}
