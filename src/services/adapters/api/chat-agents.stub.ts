/**
 * API Stubs — chat-agents (handslab-trya-chat-agents)
 *
 * AI inference services accessed via chat-backend proxy.
 * The chat-agents module runs on AWS Lambda/Bedrock using:
 *   - LangChain + Claude 3.5 Sonnet
 *   - Multi-agent architecture (Onboarding, Symptom, Result agents)
 *
 * These endpoints are NOT called directly from frontend.
 * Instead, chat-backend proxies requests to chat-agents.
 * The stubs here document the expected behavior for when
 * the integration path is: frontend → chat-backend → chat-agents.
 *
 * Target: Accessed via env.CHAT_HTTP_URL (proxied by chat-backend)
 */

import type {
  ClinicalSummary,
  ExamSuggestion,
  ReferralRecommendation,
} from '@/domain/types/clinical-intake';
import type { TriageMessage } from '@/domain/types/triage';
import type { IClinicalSummaryService, IReferralService } from '../types';

const NOT_IMPL = (method: string) =>
  new Error(`[ApiStub] ${method} not implemented — connect chat-agents first`);

// ─── Clinical Summary Service ───────────────────────────────────

export class ApiClinicalSummaryService implements IClinicalSummaryService {
  /**
   * Proxied via chat-backend:
   * POST /api/agents/summarize
   * Body: { intakeId, messages }
   * Response: ClinicalSummary
   *
   * The StructuringAgent in chat-agents processes conversation history to:
   *   - Generate a clinical narrative
   *   - Extract structured findings
   *   - Suggest CID-10 codes
   *   - Identify risk factors
   */
  async generateSummary(
    _intakeId: string,
    _messages: TriageMessage[],
  ): Promise<ClinicalSummary> {
    throw NOT_IMPL('ApiClinicalSummaryService.generateSummary');
    // TODO:
    // const { data } = await chatApi.post<ClinicalSummary>('/api/agents/summarize', {
    //   intakeId,
    //   messages: messages.map(m => ({ role: m.role, content: m.content })),
    // });
    // return data;
  }

  /**
   * POST /api/agents/summarize
   * Body: { intakeId, messages, additionalContext }
   */
  async regenerateSummary(
    _intakeId: string,
    _messages: TriageMessage[],
    _additionalContext?: string,
  ): Promise<ClinicalSummary> {
    throw NOT_IMPL('ApiClinicalSummaryService.regenerateSummary');
  }
}

// ─── Referral Service ───────────────────────────────────────────

export class ApiReferralService implements IReferralService {
  /**
   * Proxied via chat-backend:
   * POST /api/agents/referral-decision
   * Body: { intakeId, summary, exams }
   * Response: ReferralRecommendation
   *
   * The ReferralAgent in chat-agents evaluates:
   *   - Clinical summary severity
   *   - Available exam results
   *   - Social vulnerability score
   *   - Manchester protocol classification
   * To produce a RESOLVE_PRIMARY | REFER_SPECIALIST | REFER_EMERGENCY decision.
   */
  async generateRecommendation(
    _intakeId: string,
    _summary: ClinicalSummary,
    _exams: ExamSuggestion[],
  ): Promise<ReferralRecommendation> {
    throw NOT_IMPL('ApiReferralService.generateRecommendation');
    // TODO:
    // const { data } = await chatApi.post<ReferralRecommendation>(
    //   '/api/agents/referral-decision',
    //   { intakeId, summary, exams },
    // );
    // return data;
  }

  /**
   * POST /api/agents/referral-decision
   * Body: { intakeId, summary, completedExams, recalculate: true }
   *
   * Called after exams complete to reassess referral need.
   */
  async recalculateAfterExams(
    _intakeId: string,
    _summary: ClinicalSummary,
    _completedExams: ExamSuggestion[],
  ): Promise<ReferralRecommendation> {
    throw NOT_IMPL('ApiReferralService.recalculateAfterExams');
  }
}
