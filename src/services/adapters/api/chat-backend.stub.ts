/**
 * API Stubs — chat-backend (handslab-trya-chat-backend)
 *
 * Handles the conversational intake flow.
 * Real implementation will use:
 *   - WebSocket for streaming chat (env.CHAT_WS_URL)
 *   - HTTP for message send + result generation (env.CHAT_HTTP_URL)
 *
 * Target base URL: env.CHAT_HTTP_URL
 * WebSocket URL: env.CHAT_WS_URL
 */

import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import type { TriageMessage } from '@/domain/types/triage';
import type { IntakePhase } from '@/services/intake-service';
import type { IIntakeService } from '../types';

const NOT_IMPL = (method: string) =>
  new Error(`[ApiStub] ${method} not implemented — connect chat-backend first`);

export class ApiIntakeService implements IIntakeService {
  /**
   * POST /api/clinical-chat
   * Body: { sessionId, message, history }
   * Response: SSE stream with agent responses
   *
   * The chat-backend orchestrates which agent handles the message:
   *   - OnboardingAgent → greeting + identification
   *   - SymptomAgent → structured symptom collection
   *   - HistoryAgent → medical history
   *   - SocialAgent → social determinants
   *
   * Agent handoffs are signaled via `agent_handoff` SSE events.
   */
  async sendMessage(
    _intakeId: string,
    _userMessage: string,
    _currentPhase: IntakePhase,
  ): Promise<{ reply: TriageMessage; nextPhase: IntakePhase }> {
    throw NOT_IMPL('ApiIntakeService.sendMessage');
    // TODO:
    // 1. POST to CHAT_HTTP_URL/api/clinical-chat
    // 2. Read SSE stream chunks
    // 3. Detect agent_handoff events to determine nextPhase
    // 4. Accumulate text chunks into reply
  }

  /**
   * POST /api/clinical-result
   * Body: { sessionId, messages }
   * Response: ClinicalIntake (structured result)
   *
   * Triggers the ResultAgent in chat-agents which:
   *   - Generates ClinicalSummary (narrative + CID-10)
   *   - Suggests exams (with SIGTAP codes)
   *   - Produces ReferralRecommendation
   *   - Calculates risk classification (Manchester)
   */
  async generateResult(
    _intakeId: string,
    _messages: TriageMessage[],
  ): Promise<ClinicalIntake> {
    throw NOT_IMPL('ApiIntakeService.generateResult');
    // TODO:
    // const { data } = await chatApi.post<ClinicalIntake>('/api/clinical-result', {
    //   sessionId: intakeId,
    //   messages: messages.map(m => ({ role: m.role, content: m.content })),
    // });
    // return data;
  }

  getGreetingMessage(): TriageMessage {
    // Greeting is frontend-only — no backend call needed
    return {
      id: `im-greeting-${Date.now()}`,
      role: 'assistant',
      content:
        'Olá! Sou o assistente clínico do FilaZero. Vou fazer algumas perguntas para entender melhor o que você está sentindo e agilizar seu atendimento. Tudo que você compartilhar é confidencial e será usado apenas pela equipe de saúde.\n\nQual é a sua queixa principal hoje? O que trouxe você à unidade de saúde?',
      timestamp: new Date().toISOString(),
    };
  }
}
