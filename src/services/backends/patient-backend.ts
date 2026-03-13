/**
 * Patient Backend — All services consumed by the Cidadão (patient) channel.
 *
 * Aggregates: intake (chat-agents), journey tracking, auth.
 * In DEMO_MODE: 100% mock, zero network calls.
 */

// ─── Intake (AI-assisted clinical intake chat) ──────────────────
export {
  sendIntakeMessage,
  generateIntakeResult,
  getGreetingMessage,
  PHASE_ORDER,
  PHASE_LABELS,
  type IntakePhase,
} from '@/services/intake-service';

// ─── Care Journey (patient's journey timeline) ──────────────────
export {
  getCitizenJourneys,
  getJourneyById,
  getIntakeForJourney,
  getCitizenJourneyHistory,
} from '@/services/journey-service';

// ─── Auth (citizen CPF/OTP login) ───────────────────────────────
export { authService } from '@/services/auth-service';
