import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TriageMessage } from '@/domain/types/triage';
import {
  type IntakePhase,
  PHASE_ORDER,
  PHASE_LABELS,
  getGreetingMessage,
  sendIntakeMessage,
} from '@/services/intake-service';

interface IntakeChatProps {
  onComplete: (messages: TriageMessage[], phase: IntakePhase) => void;
}

export function IntakeChat({ onComplete }: IntakeChatProps) {
  const [messages, setMessages] = useState<TriageMessage[]>(() => [getGreetingMessage()]);
  const [phase, setPhase] = useState<IntakePhase>('GREETING');
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: TriageMessage = {
      id: `um-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsSending(true);

    try {
      const { reply, nextPhase } = await sendIntakeMessage('intake-current', text, phase);
      setMessages((prev) => [...prev, reply]);
      setPhase(nextPhase);

      if (nextPhase === 'PROCESSING' || nextPhase === 'COMPLETE') {
        onComplete([...updatedMessages, reply], nextPhase);
      }
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Progress calculation
  const currentIdx = PHASE_ORDER.indexOf(phase);
  const totalPhases = PHASE_ORDER.length - 2; // exclude PROCESSING, COMPLETE
  const progress = Math.min(((currentIdx) / totalPhases) * 100, 100);

  return (
    <div className="flex h-full flex-col">
      {/* Progress header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {PHASE_LABELS[phase]}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.min(currentIdx + 1, totalPhases)}/{totalPhases}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex animate-slide-up',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              )}
            >
              {msg.content.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}

        {isSending && (
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
            disabled={isSending}
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
              disabled={isSending}
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
            disabled={!input.trim() || isSending}
            className="shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
