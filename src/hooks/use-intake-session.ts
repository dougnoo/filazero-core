/**
 * useIntakeSession — React hook wrapping the intake WS session lifecycle.
 *
 * Provides a clean API for IntakeChat:
 *   - connect / send / disconnect
 *   - messages state
 *   - streaming state
 *   - progress / active agent
 *   - final result
 *
 * Automatically falls back to mock mode when ENABLE_REAL_BACKEND is off.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { WSManager } from '@/lib/ws-manager';
import { env, isChatMockMode } from '@/lib/env';
import type {
  ServerMessage,
  ServerChatMessage,
  AgentType,
  ClientMessage,
  IntakeResultPayload,
} from '@/domain/types/chat-protocol';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import {
  sendIntakeMessage as mockSendMessage,
  generateIntakeResult as mockGenerateResult,
  getGreetingMessage,
  type IntakePhase,
  PHASE_ORDER,
} from '@/services/intake-service';

// ─── State shape ────────────────────────────────────────────────

export interface IntakeSessionState {
  /** Chat messages (display) */
  messages: ServerChatMessage[];
  /** Session ID from backend */
  sessionId: string | null;
  /** Currently active AI agent */
  activeAgent: AgentType | null;
  /** Overall progress 0-100 */
  progress: number;
  /** Whether the agent is currently responding */
  isAgentTyping: boolean;
  /** Streaming text being built */
  streamingText: string;
  /** Processing stage (post-chat) */
  processingStage: string | null;
  /** Final structured result */
  result: ClinicalIntake | null;
  /** Connection/session error */
  error: string | null;
  /** Is connected to backend */
  isConnected: boolean;
}

export interface IntakeSessionActions {
  /** Start session (connects WS or inits mock) */
  startSession: (citizenId: string, unitId: string) => void;
  /** Send user message */
  sendMessage: (content: string) => Promise<void>;
  /** Clean up */
  disconnect: () => void;
}

export function useIntakeSession(): IntakeSessionState & IntakeSessionActions {
  const [messages, setMessages] = useState<ServerChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const [progress, setProgress] = useState(0);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalIntake | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WSManager | null>(null);

  // ── Mock state refs ──
  const mockPhaseRef = useRef<IntakePhase>('GREETING');
  const mockMessagesRef = useRef<ServerChatMessage[]>([]);

  // ─── Real WebSocket handlers ──────────────────────────────────

  const handleServerMessage = useCallback((raw: unknown) => {
    const msg = raw as ServerMessage;

    switch (msg.type) {
      case 'session_started': {
        setSessionId(msg.payload.sessionId);
        setActiveAgent(msg.payload.activeAgent);
        if (msg.payload.history?.length) {
          setMessages(msg.payload.history);
        }
        break;
      }

      case 'agent_message': {
        setIsAgentTyping(false);
        setStreamingText('');
        setMessages((prev) => [...prev, msg.payload]);
        break;
      }

      case 'agent_stream': {
        setIsAgentTyping(true);
        if (msg.payload.done) {
          setIsAgentTyping(false);
          setStreamingText('');
          // Full message will arrive as agent_message
        } else {
          setStreamingText((prev) => prev + msg.payload.delta);
        }
        break;
      }

      case 'agent_handoff': {
        setActiveAgent(msg.payload.toAgent);
        setProgress(msg.payload.progress);
        break;
      }

      case 'processing_started': {
        setProcessingStage(msg.payload.stage);
        break;
      }

      case 'intake_result': {
        setProcessingStage(null);
        setResult(mapResultPayloadToClinicalIntake(msg.payload.sessionId, msg.payload.result, messages));
        break;
      }

      case 'error': {
        setError(msg.payload.message);
        setIsAgentTyping(false);
        break;
      }

      case 'pong':
        break;
    }
  }, [messages]);

  // ─── Start session ────────────────────────────────────────────

  const startSession = useCallback((citizenId: string, unitId: string) => {
    setError(null);
    setResult(null);
    setProcessingStage(null);
    setProgress(0);

    if (isChatMockMode()) {
      // Mock mode: initialize with greeting
      const sid = `mock-${Date.now()}`;
      setSessionId(sid);
      setActiveAgent('onboarding');
      setIsConnected(true);

      const greeting = getGreetingMessage();
      const greetingChat: ServerChatMessage = {
        id: greeting.id,
        sessionId: sid,
        role: 'assistant',
        content: greeting.content,
        agent: 'onboarding',
        timestamp: greeting.timestamp,
      };
      setMessages([greetingChat]);
      mockMessagesRef.current = [greetingChat];
      mockPhaseRef.current = 'GREETING';
      return;
    }

    // Real mode: connect WebSocket
    const ws = new WSManager(env.CHAT_WS_URL, {
      token: null, // Will be injected by session accessor pattern
      municipalityId: null,
    });

    ws.on('message', handleServerMessage);
    ws.on('status', (status) => {
      setIsConnected(status === 'connected');
      if (status === 'error') {
        setError('Conexão perdida com o servidor. Tentando reconectar...');
      }
    });
    ws.on('error', (err) => {
      setError(err.message);
    });

    wsRef.current = ws;
    ws.connect();

    // After connection, send start_session
    const startMsg: ClientMessage = {
      type: 'start_session',
      payload: { citizenId, unitId },
    };

    // Wait for connection then send
    const unsub = ws.on('status', (s) => {
      if (s === 'connected') {
        ws.send(startMsg);
        unsub();
      }
    });
  }, [handleServerMessage]);

  // ─── Send message ─────────────────────────────────────────────

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId) return;

    // Add user message to state immediately
    const userMsg: ServerChatMessage = {
      id: `um-${Date.now()}`,
      sessionId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAgentTyping(true);
    setError(null);

    if (isChatMockMode()) {
      // Mock path: use existing mock service
      try {
        const { reply, nextPhase } = await mockSendMessage(sessionId, content, mockPhaseRef.current);
        mockPhaseRef.current = nextPhase;

        const agentMsg: ServerChatMessage = {
          id: reply.id,
          sessionId,
          role: 'assistant',
          content: reply.content,
          agent: phaseToAgent(nextPhase),
          timestamp: reply.timestamp,
        };

        const currentIdx = PHASE_ORDER.indexOf(nextPhase);
        const totalPhases = PHASE_ORDER.length - 2;
        setProgress(Math.min((currentIdx / totalPhases) * 100, 100));
        setActiveAgent(phaseToAgent(nextPhase));
        setMessages((prev) => [...prev, agentMsg]);
        mockMessagesRef.current = [...mockMessagesRef.current, userMsg, agentMsg];

        if (nextPhase === 'PROCESSING' || nextPhase === 'COMPLETE') {
          setIsAgentTyping(false);
          setProcessingStage('structuring');
          const intakeResult = await mockGenerateResult(sessionId, mockMessagesRef.current.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })));
          setProcessingStage(null);
          setResult(intakeResult);
        }
      } catch {
        setError('Erro ao processar mensagem. Tente novamente.');
      } finally {
        setIsAgentTyping(false);
      }
      return;
    }

    // Real path: send via WebSocket
    const ws = wsRef.current;
    if (!ws?.isConnected) {
      setError('Sem conexão com o servidor.');
      setIsAgentTyping(false);
      return;
    }

    const msg: ClientMessage = {
      type: 'user_message',
      payload: { sessionId, content },
    };
    ws.send(msg);
  }, [sessionId]);

  // ─── Disconnect ───────────────────────────────────────────────

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.disconnect();
      wsRef.current = null;
    };
  }, []);

  return {
    messages,
    sessionId,
    activeAgent,
    progress,
    isAgentTyping,
    streamingText,
    processingStage,
    result,
    error,
    isConnected,
    startSession,
    sendMessage,
    disconnect,
  };
}

// ─── Helpers ────────────────────────────────────────────────────

function phaseToAgent(phase: IntakePhase): AgentType {
  switch (phase) {
    case 'GREETING':
    case 'CHIEF_COMPLAINT':
      return 'onboarding';
    case 'SYMPTOM_DETAILS':
    case 'MEDICAL_HISTORY':
    case 'MEDICATIONS':
    case 'ALLERGIES':
      return 'symptoms';
    case 'SOCIAL_CONTEXT':
    case 'DOCUMENTS':
      return 'onboarding';
    case 'PROCESSING':
      return 'structuring';
    case 'COMPLETE':
      return 'structuring';
    default:
      return 'onboarding';
  }
}

function mapResultPayloadToClinicalIntake(
  sessionId: string,
  payload: IntakeResultPayload,
  msgs: ServerChatMessage[],
): ClinicalIntake {
  const now = new Date().toISOString();
  return {
    id: payload.intakeId,
    citizenId: '',
    unitId: '',
    messages: msgs.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    })),
    chiefComplaint: payload.chiefComplaint,
    symptoms: payload.symptoms,
    symptomDuration: payload.symptomDuration,
    painScale: payload.painScale,
    riskLevel: payload.riskLevel as any,
    priorityScore: payload.priorityScore,
    clinicalSummary: {
      id: `cs-${sessionId}`,
      intakeId: payload.intakeId,
      narrative: payload.clinicalSummary.narrative,
      structuredFindings: payload.clinicalSummary.structuredFindings,
      suspectedConditions: payload.clinicalSummary.suspectedConditions,
      relevantHistory: '',
      riskFactors: payload.clinicalSummary.riskFactors,
      generatedAt: now,
    },
    examSuggestions: payload.examSuggestions.map((e, i) => ({
      id: `ex-${i}`,
      intakeId: payload.intakeId,
      examName: e.examName,
      examCode: e.examCode,
      category: e.category as any,
      priority: e.priority as any,
      justification: e.justification,
      status: 'SUGGESTED' as const,
    })),
    referralRecommendation: {
      id: `rr-${sessionId}`,
      intakeId: payload.intakeId,
      decision: payload.referralRecommendation.decision as any,
      confidence: payload.referralRecommendation.confidence,
      specialty: payload.referralRecommendation.specialty,
      justification: payload.referralRecommendation.justification,
      requiredExamsBeforeReferral: payload.referralRecommendation.requiredExamsBeforeReferral,
      alternativeActions: payload.referralRecommendation.alternativeActions,
      generatedAt: now,
    },
    isComplete: true,
    startedAt: msgs[0]?.timestamp ?? now,
    completedAt: now,
  };
}
