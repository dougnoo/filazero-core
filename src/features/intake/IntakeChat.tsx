import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServerChatMessage } from '@/domain/types/chat-protocol';
import drIaAvatar from '@/assets/dr-ia-avatar.png';
import type { ClinicalIntake } from '@/domain/types/clinical-intake';
import { useIntakeSession } from '@/hooks/use-intake-session';

interface IntakeChatProps {
  onComplete: (result: ClinicalIntake) => void;
  citizenId?: string;
  unitId?: string;
}

export function IntakeChat({ onComplete, citizenId = 'c-current', unitId = 'u-1' }: IntakeChatProps) {
  const {
    messages,
    isAgentTyping,
    streamingText,
    processingStage,
    result,
    error,
    startSession,
    sendMessage,
  } = useIntakeSession();

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startSession(citizenId, unitId);
    }
  }, [citizenId, unitId, startSession]);

  useEffect(() => {
    if (result) onComplete(result);
  }, [result, onComplete]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isAgentTyping || processingStage) return;
    setInput('');
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Processing overlay ────────────────────────────────────
  if (processingStage) {
    return (
      <div className="flex h-full flex-col">
        <ChatHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Processando seus dados</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nossa inteligência clínica está analisando suas informações.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
            {processingStage === 'structuring'
              ? 'Estruturando dados clínicos...'
              : processingStage === 'exam_suggestion'
                ? 'Analisando exames necessários...'
                : 'Processando...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <ChatHeader />

      {/* Error banner */}
      {error && (
        <div className="bg-destructive/10 px-4 py-2 text-xs text-destructive text-center">
          {error}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming preview */}
        {isAgentTyping && streamingText && (
          <div className="flex items-end gap-2 justify-start">
            <img src={drIaAvatar} alt="Dr. IA" className="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm" />
            <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm">
              {streamingText}
              <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-foreground/30" />
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isAgentTyping && !streamingText && (
          <div className="flex items-end gap-2 justify-start">
            <img src={drIaAvatar} alt="Dr. IA" className="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm" />
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-card px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-border bg-card px-3 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={isAgentTyping || !!processingStage}
            className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAgentTyping}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
              input.trim() && !isAgentTyping
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Header (Trya style) ────────────────────────────────────────

function ChatHeader() {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <button className="text-foreground">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
        <img src={drIaAvatar} alt="Dr. IA" className="h-7 w-7 rounded-full object-cover" />
        <span className="font-[var(--font-display)] text-lg font-bold tracking-tight text-foreground">
          Dr. IA Triagem
        </span>
      </div>
      <div className="w-5" />
    </div>
  );
}

// ─── Chat Bubble ────────────────────────────────────────────────

function ChatBubble({ message }: { message: ServerChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <img src={drIaAvatar} alt="Dr. IA" className="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm" />
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
            : 'rounded-bl-sm bg-card text-foreground shadow-sm'
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
