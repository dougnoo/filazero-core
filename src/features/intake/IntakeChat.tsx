import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Loader2, Wifi, WifiOff, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ServerChatMessage, AgentType } from '@/domain/types/chat-protocol';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import { useIntakeSession } from '@/hooks/use-intake-session';

// ─── Agent display names ────────────────────────────────────────

const AGENT_LABELS: Record<AgentType, string> = {
  onboarding: 'Cadastro e Contexto',
  symptoms: 'Análise de Sintomas',
  structuring: 'Estruturação Clínica',
  exam_suggestion: 'Sugestão de Exames',
  referral_advisor: 'Recomendação',
};

// ─── Props ──────────────────────────────────────────────────────

interface IntakeChatProps {
  onComplete: (result: ClinicalIntake) => void;
  citizenId?: string;
  unitId?: string;
}

export function IntakeChat({ onComplete, citizenId = 'c-current', unitId = 'u-1' }: IntakeChatProps) {
  const {
    messages,
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
  } = useIntakeSession();

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasStarted = useRef(false);

  // Start session on mount
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startSession(citizenId, unitId);
    }
  }, [citizenId, unitId, startSession]);

  // Propagate result to parent
  useEffect(() => {
    if (result) {
      onComplete(result);
    }
  }, [result, onComplete]);

  // Scroll to bottom on new messages or streaming
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  // ─── Send handler ──────────────────────────────────────────

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isAgentTyping || processingStage) return;

    setInput('');
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Processing overlay ────────────────────────────────────

  if (processingStage) {
    const stageLabels: Record<string, string> = {
      structuring: 'Estruturando dados clínicos',
      exam_suggestion: 'Analisando exames necessários',
      referral_analysis: 'Gerando recomendação de encaminhamento',
    };

    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Processando seus dados
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nossa inteligência clínica está analisando suas informações.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            {stageLabels[processingStage] ?? 'Processando...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progress header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Bot className="h-3.5 w-3.5" />
            {activeAgent ? AGENT_LABELS[activeAgent] : 'Assistente Clínico'}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isConnected ? (
              <Wifi className="h-3 w-3 text-primary" />
            ) : (
              <WifiOff className="h-3 w-3 text-destructive" />
            )}
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming text preview */}
        {isAgentTyping && streamingText && (
          <div className="flex justify-start animate-slide-up">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
              {streamingText}
              <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-foreground/40" />
            </div>
          </div>
        )}

        {/* Typing indicator (no stream content yet) */}
        {isAgentTyping && !streamingText && (
          <div className="flex justify-start animate-slide-up">
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground rounded-bl-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-3">
        <div className="mx-auto flex max-w-lg items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground"
            title="Anexar documento"
            disabled={isAgentTyping}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua resposta..."
              rows={1}
              disabled={isAgentTyping || !!processingStage}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              style={{ minHeight: '2.75rem', maxHeight: '6rem' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 96) + 'px';
              }}
            />
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isAgentTyping}
            className="shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Bubble ────────────────────────────────────────────────

function ChatBubble({ message }: { message: ServerChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex animate-slide-up', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        {message.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
