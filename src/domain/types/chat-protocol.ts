/**
 * Chat Protocol — Client ↔ chat-backend ↔ chat-agents message contract.
 *
 * Defines the exact WebSocket frames exchanged between the frontend and
 * the existing Trya chat-backend (Express/NestJS) + chat-agents (Python/LangChain).
 *
 * Backend reference:
 *   chat-backend handles session lifecycle, routing, persistence.
 *   chat-agents runs Bedrock/Claude agents (Onboarding, Symptoms, Structuring, Exam, Referral).
 *
 * Transport: WebSocket (wss://), JSON frames.
 * Auth: JWT token as query param on connect (?token=...).
 * Tenant isolation: municipality param on connect (?municipality=...).
 */

// ═══════════════════════════════════════════════════════════════════
// Client → Server messages
// ═══════════════════════════════════════════════════════════════════

/** Start a new intake session */
export interface StartSessionMessage {
  type: 'start_session';
  payload: {
    citizenId: string;
    unitId: string;
    /** Optional: resume an existing session */
    sessionId?: string;
  };
}

/** Send user's text message */
export interface UserTextMessage {
  type: 'user_message';
  payload: {
    sessionId: string;
    content: string;
    /** Optional: attached document references (file IDs from storage) */
    attachments?: string[];
  };
}

/** User skipped an optional question */
export interface UserSkipMessage {
  type: 'user_skip';
  payload: {
    sessionId: string;
  };
}

/** Client requests the final structured result */
export interface RequestResultMessage {
  type: 'request_result';
  payload: {
    sessionId: string;
  };
}

/** Client pings to keep connection alive */
export interface PingMessage {
  type: 'ping';
}

export type ClientMessage =
  | StartSessionMessage
  | UserTextMessage
  | UserSkipMessage
  | RequestResultMessage
  | PingMessage;

// ═══════════════════════════════════════════════════════════════════
// Server → Client messages
// ═══════════════════════════════════════════════════════════════════

/** Session created/resumed confirmation */
export interface SessionStartedEvent {
  type: 'session_started';
  payload: {
    sessionId: string;
    /** Which agent is currently active */
    activeAgent: AgentType;
    /** Messages history (if resuming) */
    history?: ServerChatMessage[];
  };
}

/** Agent sends a complete message */
export interface AgentMessageEvent {
  type: 'agent_message';
  payload: ServerChatMessage;
}

/** Agent is streaming a response token-by-token */
export interface AgentStreamEvent {
  type: 'agent_stream';
  payload: {
    sessionId: string;
    /** Incremental text chunk */
    delta: string;
    /** Message ID being built */
    messageId: string;
    /** True when this is the last chunk */
    done: boolean;
  };
}

/** Agent handoff — conversation moves to next agent */
export interface AgentHandoffEvent {
  type: 'agent_handoff';
  payload: {
    sessionId: string;
    fromAgent: AgentType;
    toAgent: AgentType;
    /** Progress percentage 0-100 */
    progress: number;
  };
}

/** Processing started (structuring/exam/referral agents running) */
export interface ProcessingStartedEvent {
  type: 'processing_started';
  payload: {
    sessionId: string;
    /** What's being processed */
    stage: 'structuring' | 'exam_suggestion' | 'referral_analysis';
  };
}

/** Final structured result ready */
export interface IntakeResultEvent {
  type: 'intake_result';
  payload: {
    sessionId: string;
    result: IntakeResultPayload;
  };
}

/** Server error */
export interface ServerErrorEvent {
  type: 'error';
  payload: {
    sessionId?: string;
    code: string;
    message: string;
    retryable: boolean;
  };
}

/** Pong response */
export interface PongEvent {
  type: 'pong';
}

export type ServerMessage =
  | SessionStartedEvent
  | AgentMessageEvent
  | AgentStreamEvent
  | AgentHandoffEvent
  | ProcessingStartedEvent
  | IntakeResultEvent
  | ServerErrorEvent
  | PongEvent;

// ═══════════════════════════════════════════════════════════════════
// Shared sub-types
// ═══════════════════════════════════════════════════════════════════

export type AgentType =
  | 'onboarding'
  | 'symptoms'
  | 'structuring'
  | 'exam_suggestion'
  | 'referral_advisor';

export interface ServerChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: AgentType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * The final structured clinical intake result delivered by the backend.
 * Maps to the ClinicalIntake domain type on the frontend.
 */
export interface IntakeResultPayload {
  intakeId: string;
  chiefComplaint: string;
  symptoms: string[];
  symptomDuration?: string;
  painScale?: number;
  riskLevel: string;
  priorityScore: number;
  clinicalSummary: {
    narrative: string;
    structuredFindings: string[];
    suspectedConditions: string[];
    riskFactors: string[];
  };
  examSuggestions: Array<{
    examName: string;
    examCode?: string;
    category: string;
    priority: string;
    justification: string;
  }>;
  referralRecommendation: {
    decision: string;
    confidence: number;
    specialty?: string;
    justification: string;
    requiredExamsBeforeReferral: string[];
    alternativeActions?: string[];
  };
}
