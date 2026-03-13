/**
 * ApiIntakeService — Real implementation for chat-backend.
 *
 * Connects to:
 *   POST /api/clinical-chat     → send message (SSE streaming response)
 *   POST /api/clinical-result   → generate structured clinical result
 *
 * Base URL: env.CHAT_HTTP_URL
 * Auth: Bearer JWT + X-Municipality-Id + X-Unit-Id (via api-client.ts)
 *
 * ─── SSE Stream Handling ───────────────────────────────────────────
 * The chat-backend returns an SSE stream with OpenAI-compatible chunks:
 *   data: {"choices":[{"delta":{"content":"..."}}]}
 *   data: [DONE]
 *
 * Agent handoffs are detected via completion signals in the response
 * text, mapping to IntakePhase transitions on the frontend.
 *
 * ─── Error Resilience ──────────────────────────────────────────────
 * This class does NOT handle fallback — that responsibility belongs
 * to the ResilientIntakeService wrapper in the factory.
 */

import { chatApi } from '@/lib/api-client';
import { env } from '@/lib/env';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { TriageMessage } from '@/domain/types/triage';
import type { IntakeResultPayload } from '@/domain/types/chat-protocol';
import { RiskLevel } from '@/domain/enums/risk-level';
import type { IntakePhase } from '@/services/intake-service';
import type { IIntakeService } from '@/services/adapters/types';

// ═══════════════════════════════════════════════════════════════════
// §1 — Session history (maintained per intake for multi-turn context)
// ═══════════════════════════════════════════════════════════════════

const sessionHistory = new Map<string, Array<{ role: string; content: string }>>();

// ═══════════════════════════════════════════════════════════════════
// §2 — Phase detection from response content
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

// ═══════════════════════════════════════════════════════════════════
// §3 — DTO Mappers
// ═══════════════════════════════════════════════════════════════════

let msgCounter = 200;
function makeMsg(role: 'user' | 'assistant', content: string): TriageMessage {
  msgCounter++;
  return {
    id: `im-api-${msgCounter}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

const RISK_LEVEL_MAP: Record<string, RiskLevel> = {
  EMERGENCY: RiskLevel.EMERGENCY,
  VERY_URGENT: RiskLevel.VERY_URGENT,
  URGENT: RiskLevel.URGENT,
  LESS_URGENT: RiskLevel.LESS_URGENT,
  NON_URGENT: RiskLevel.NON_URGENT,
  // Manchester color aliases (PT)
  VERMELHO: RiskLevel.EMERGENCY,
  LARANJA: RiskLevel.VERY_URGENT,
  AMARELO: RiskLevel.URGENT,
  VERDE: RiskLevel.LESS_URGENT,
  AZUL: RiskLevel.NON_URGENT,
  // Manchester color aliases (EN)
  RED: RiskLevel.EMERGENCY,
  ORANGE: RiskLevel.VERY_URGENT,
  YELLOW: RiskLevel.URGENT,
  GREEN: RiskLevel.LESS_URGENT,
  BLUE: RiskLevel.NON_URGENT,
};

function mapResultPayload(
  intakeId: string,
  data: IntakeResultPayload | Record<string, unknown>,
  messages: TriageMessage[],
): ClinicalIntake {
  const now = new Date().toISOString();
  const d = data as Record<string, unknown>;

  return {
    id: intakeId,
    citizenId: 'c-current',
    unitId: 'u-1',
    messages,
    chiefComplaint: (d.chiefComplaint as string) || (d.chief_complaint as string) || 'Não informado',
    symptoms: (d.symptoms as string[]) || [],
    symptomDuration: (d.symptomDuration as string) ?? (d.symptom_duration as string),
    painScale: (d.painScale as number) ?? (d.pain_scale as number),
    currentMedications: (d.currentMedications as string[]) || (d.current_medications as string[]) || [],
    allergies: (d.allergies as string[]) || [],
    chronicConditions: (d.chronicConditions as string[]) || (d.chronic_conditions as string[]) || [],
    familyHistory: (d.familyHistory as string[]) || (d.family_history as string[]) || [],
    riskLevel:
      RISK_LEVEL_MAP[((d.riskLevel as string) ?? (d.risk_level as string) ?? '').toUpperCase()] ??
      RiskLevel.LESS_URGENT,
    priorityScore: (d.priorityScore as number) ?? (d.priority_score as number) ?? 50,
    clinicalSummary: mapClinicalSummary(intakeId, d),
    examSuggestions: mapExamSuggestions(intakeId, d),
    referralRecommendation: mapReferral(intakeId, d),
    isComplete: true,
    startedAt: messages[0]?.timestamp ?? now,
    completedAt: now,
  };
}

function mapClinicalSummary(intakeId: string, d: Record<string, unknown>) {
  const cs = (d.clinicalSummary ?? d.clinical_summary ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();
  return {
    id: `cs-${intakeId}`,
    intakeId,
    narrative: (cs.narrative as string) || '',
    structuredFindings: (cs.structuredFindings as string[]) || (cs.structured_findings as string[]) || [],
    suspectedConditions: (cs.suspectedConditions as string[]) || (cs.suspected_conditions as string[]) || [],
    relevantHistory: (cs.relevantHistory as string) ?? (cs.relevant_history as string) ?? '',
    riskFactors: (cs.riskFactors as string[]) || (cs.risk_factors as string[]) || [],
    generatedAt: (cs.generatedAt as string) ?? (cs.generated_at as string) ?? now,
  };
}

function mapExamSuggestions(intakeId: string, d: Record<string, unknown>) {
  const exams = (d.examSuggestions ?? d.exam_suggestions ?? []) as Array<Record<string, unknown>>;
  return exams.map((e, i) => ({
    id: `ex-${i}`,
    intakeId,
    examName: (e.examName as string) ?? (e.exam_name as string) ?? '',
    examCode: (e.examCode as string) ?? (e.exam_code as string),
    category: ((e.category as string) || 'OTHER') as 'LABORATORY' | 'IMAGING' | 'FUNCTIONAL' | 'OTHER',
    priority: ((e.priority as string) || 'ROUTINE') as 'URGENT' | 'ROUTINE',
    justification: (e.justification as string) || '',
    status: 'SUGGESTED' as const,
  }));
}

function mapReferral(intakeId: string, d: Record<string, unknown>) {
  const rr = (d.referralRecommendation ?? d.referral_recommendation ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();
  return {
    id: `rr-${intakeId}`,
    intakeId,
    decision: ((rr.decision as string) || 'NEEDS_MORE_DATA') as
      | 'RESOLVE_PRIMARY'
      | 'REFER_SPECIALIST'
      | 'REFER_EMERGENCY'
      | 'NEEDS_MORE_DATA',
    confidence: (rr.confidence as number) ?? 50,
    specialty: rr.specialty as string | undefined,
    justification: (rr.justification as string) || '',
    requiredExamsBeforeReferral:
      (rr.requiredExamsBeforeReferral as string[]) ||
      (rr.required_exams_before_referral as string[]) ||
      [],
    alternativeActions:
      (rr.alternativeActions as string[]) || (rr.alternative_actions as string[]) || [],
    generatedAt: (rr.generatedAt as string) ?? (rr.generated_at as string) ?? now,
  };
}

// ═══════════════════════════════════════════════════════════════════
// §4 — SSE Stream Reader
// ═══════════════════════════════════════════════════════════════════

async function readSSEStream(response: Response): Promise<string> {
  if (!response.body) throw new Error('No response body for SSE stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let fullResponse = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
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
      if (jsonStr === '[DONE]') return fullResponse;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) fullResponse += content;
      } catch {
        // Incomplete JSON — put back and wait for more data
        textBuffer = line + '\n' + textBuffer;
        break;
      }
    }
  }

  return fullResponse;
}

// ═══════════════════════════════════════════════════════════════════
// §5 — ApiIntakeService Implementation
// ═══════════════════════════════════════════════════════════════════

export class ApiIntakeService implements IIntakeService {
  /**
   * POST /api/clinical-chat
   * Body: { messages: [{ role, content }] }
   * Response: SSE stream
   */
  async sendMessage(
    intakeId: string,
    userMessage: string,
    currentPhase: IntakePhase,
  ): Promise<{ reply: TriageMessage; nextPhase: IntakePhase }> {
    if (!sessionHistory.has(intakeId)) sessionHistory.set(intakeId, []);
    const history = sessionHistory.get(intakeId)!;
    history.push({ role: 'user', content: userMessage });

    // Direct fetch for SSE — chatApi doesn't support streaming
    const url = `${env.CHAT_HTTP_URL}/api/clinical-chat`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ messages: history }),
    });

    if (!resp.ok) {
      throw new Error(`Chat request failed: ${resp.status}`);
    }

    const fullResponse = await readSSEStream(resp);
    if (!fullResponse) throw new Error('Empty response from chat-backend');

    history.push({ role: 'assistant', content: fullResponse });
    const nextPhase = detectPhaseFromResponse(fullResponse, currentPhase, history.length);

    return { reply: makeMsg('assistant', fullResponse), nextPhase };
  }

  /**
   * POST /api/clinical-result
   * Body: { sessionId, messages: [{ role, content }] }
   * Response: IntakeResultPayload (JSON)
   */
  async generateResult(
    intakeId: string,
    messages: TriageMessage[],
  ): Promise<ClinicalIntake> {
    const history =
      sessionHistory.get(intakeId) ??
      messages.map((m) => ({ role: m.role, content: m.content }));

    const { data } = await chatApi.post<IntakeResultPayload | Record<string, unknown>>(
      '/api/clinical-result',
      {
        sessionId: intakeId,
        messages: history,
      },
    );

    sessionHistory.delete(intakeId);
    return mapResultPayload(intakeId, data, messages);
  }

  /**
   * Greeting is frontend-only — no backend call needed.
   */
  getGreetingMessage(): TriageMessage {
    return makeMsg(
      'assistant',
      'Olá! Sou o assistente clínico do FilaZero. Vou fazer algumas perguntas para entender melhor o que você está sentindo e agilizar seu atendimento. Tudo que você compartilhar é confidencial e será usado apenas pela equipe de saúde.\n\nQual é a sua queixa principal hoje? O que trouxe você à unidade de saúde?',
    );
  }
}
