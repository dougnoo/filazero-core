/**
 * Patient Backend — All services consumed by the Cidadão (patient) channel.
 *
 * Now delegates to the service adapter layer (factory picks mock vs real API).
 * In DEMO_MODE: 100% mock, zero network calls.
 */

import { services } from '@/services/adapters';

// ─── Intake (AI-assisted clinical intake chat) ──────────────────
export const sendIntakeMessage = services.intake.sendMessage.bind(services.intake);
export const generateIntakeResult = services.intake.generateResult.bind(services.intake);
export const getGreetingMessage = services.intake.getGreetingMessage.bind(services.intake);
export { PHASE_ORDER, PHASE_LABELS, type IntakePhase } from '@/services/intake-service';

// ─── Care Journey (patient's journey timeline) ──────────────────
export const getCitizenJourneys = services.journeys.getCitizenJourneys.bind(services.journeys);
export const getJourneyById = services.journeys.getJourneyById.bind(services.journeys);
export const getIntakeForJourney = services.journeys.getIntakeForJourney.bind(services.journeys);
export const getCitizenJourneyHistory = services.journeys.getCitizenJourneyHistory.bind(services.journeys);

// ─── Auth (citizen CPF/OTP login) ───────────────────────────────
export { authService } from '@/services/auth-service';
