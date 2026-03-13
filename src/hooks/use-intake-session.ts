/**
 * useIntakeSession — React hook for the clinical intake chat.
 *
 * Now powered by Lovable AI Gateway via edge functions:
 * - clinical-chat: Streaming clinical conversation agent
 * - clinical-result: Structured output generation
 *
 * The hook manages conversation state, phase tracking, and result generation.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ServerChatMessage, AgentType } from '@/domain/types/chat-protocol';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import {
  sendIntakeMessage,
  generateIntakeResult,
  getGreetingMessage,
  type IntakePhase,
  PHASE_ORDER,
} from '@/services/intake-service';

// ─── State shape ────────────────────────────────────────────────

export interface IntakeSessionState {
  messages: ServerChatMessage[];
  sessionId: string | null;
  activeAgent: AgentType | null;
  progress: number;
  isAgentTyping: boolean;
  streamingText: string;
  processingStage: string | null;
  result: ClinicalIntake | null;
  error: string | null;
  isConnected: boolean;
}

export interface IntakeSessionActions {
  startSession: (citizenId: string, unitId: string) => void;
  sendMessage: (content: string) => Promise<void>;
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

  const phaseRef = useRef<IntakePhase>('GREETING');
  const messagesRef = useRef<ServerChatMessage[]>([]);

  // ─── Start session ────────────────────────────────────────────

  const startSession = useCallback((_citizenId: string, _unitId: string) => {
    setError(null);
    setResult(null);
    setProcessingStage(null);
    setProgress(0);

    const sid = `session-${Date.now()}`;
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
    messagesRef.current = [greetingChat];
    phaseRef.current = 'GREETING';
  }, []);

  // ─── Send message ─────────────────────────────────────────────

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId) return;

    const userMsg: ServerChatMessage = {
      id: `um-${Date.now()}`,
      sessionId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    messagesRef.current = [...messagesRef.current, userMsg];
    setIsAgentTyping(true);
    setError(null);

    try {
      const { reply, nextPhase } = await sendIntakeMessage(
        sessionId,
        content,
        phaseRef.current,
      );
      phaseRef.current = nextPhase;

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
      messagesRef.current = [...messagesRef.current, agentMsg];

      if (nextPhase === 'PROCESSING' || nextPhase === 'COMPLETE') {
        setIsAgentTyping(false);
        setProcessingStage('structuring');

        try {
          const intakeResult = await generateIntakeResult(
            sessionId,
            messagesRef.current.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: m.timestamp,
            })),
          );
          setProcessingStage(null);
          setResult(intakeResult);
        } catch (resultError) {
          console.error('[useIntakeSession] Result generation failed:', resultError);
          setProcessingStage(null);
          setError('Erro ao gerar resultado clínico. Tente novamente.');
        }
      }
    } catch (err) {
      console.error('[useIntakeSession] Send error:', err);
      setError('Erro ao processar mensagem. Tente novamente.');
    } finally {
      setIsAgentTyping(false);
    }
  }, [sessionId]);

  // ─── Disconnect ───────────────────────────────────────────────

  const disconnect = useCallback(() => {
    setIsConnected(false);
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
    case 'COMPLETE':
      return 'structuring';
    default:
      return 'onboarding';
  }
}
