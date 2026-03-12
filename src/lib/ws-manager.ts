/**
 * WebSocket Manager — Reusable connection layer for chat-backend.
 *
 * Designed for the Trya chat-backend WebSocket protocol:
 * - JWT auth on connect
 * - JSON message frames
 * - Reconnection with exponential backoff
 * - Event-based message handling
 *
 * Usage:
 *   const ws = new WSManager(url, { token });
 *   ws.on('message', (data) => { ... });
 *   ws.connect();
 *   ws.send({ type: 'user_message', content: '...' });
 *   ws.disconnect();
 */

export type WSStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface WSManagerOptions {
  /** JWT token for auth (sent as query param or first message) */
  token?: string | null;
  /** Municipality ID for tenant isolation */
  municipalityId?: string | null;
  /** Max reconnection attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Base reconnect delay ms (default: 1000, doubles each attempt) */
  reconnectBaseDelay?: number;
  /** Send token as query param vs first-frame auth message */
  authMode?: 'query' | 'message';
}

type MessageHandler = (data: unknown) => void;
type StatusHandler = (status: WSStatus) => void;
type ErrorHandler = (error: Error) => void;

export class WSManager {
  private url: string;
  private opts: Required<WSManagerOptions>;
  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();

  private _status: WSStatus = 'idle';

  constructor(url: string, opts: WSManagerOptions = {}) {
    this.url = url;
    this.opts = {
      token: opts.token ?? null,
      municipalityId: opts.municipalityId ?? null,
      maxReconnectAttempts: opts.maxReconnectAttempts ?? 5,
      reconnectBaseDelay: opts.reconnectBaseDelay ?? 1000,
      authMode: opts.authMode ?? 'query',
    };
  }

  get status(): WSStatus { return this._status; }
  get isConnected(): boolean { return this._status === 'connected'; }

  // ─── Event registration ───────────────────────────────────────

  on(event: 'message', handler: MessageHandler): () => void;
  on(event: 'status', handler: StatusHandler): () => void;
  on(event: 'error', handler: ErrorHandler): () => void;
  on(event: 'message' | 'status' | 'error', handler: MessageHandler | StatusHandler | ErrorHandler): () => void {
    const set = event === 'message' ? this.messageHandlers
      : event === 'status' ? this.statusHandlers
      : this.errorHandlers;
    (set as Set<typeof handler>).add(handler);
    return () => { (set as Set<typeof handler>).delete(handler); };
  }

  // ─── Connection lifecycle ─────────────────────────────────────

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.intentionalClose = false;
    this.setStatus('connecting');

    let connectUrl = this.url;
    if (this.opts.authMode === 'query' && this.opts.token) {
      const sep = connectUrl.includes('?') ? '&' : '?';
      connectUrl += `${sep}token=${encodeURIComponent(this.opts.token)}`;
    }
    if (this.opts.municipalityId) {
      const sep = connectUrl.includes('?') ? '&' : '?';
      connectUrl += `${sep}municipality=${encodeURIComponent(this.opts.municipalityId)}`;
    }

    this.ws = new WebSocket(connectUrl);

    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.setStatus('connected');

      // If auth via first message
      if (this.opts.authMode === 'message' && this.opts.token) {
        this.ws?.send(JSON.stringify({ type: 'auth', token: this.opts.token }));
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        this.messageHandlers.forEach((h) => h(data));
      } catch {
        this.messageHandlers.forEach((h) => h(event.data));
      }
    };

    this.ws.onerror = () => {
      this.errorHandlers.forEach((h) => h(new Error('WebSocket error')));
    };

    this.ws.onclose = () => {
      if (this.intentionalClose) {
        this.setStatus('disconnected');
      } else {
        this.attemptReconnect();
      }
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.setStatus('disconnected');
  }

  send(data: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WSManager] Cannot send — not connected');
      return;
    }
    this.ws.send(JSON.stringify(data));
  }

  /** Update token (e.g. after refresh) without reconnecting */
  updateToken(token: string): void {
    this.opts.token = token;
  }

  // ─── Internal ─────────────────────────────────────────────────

  private setStatus(s: WSStatus): void {
    this._status = s;
    this.statusHandlers.forEach((h) => h(s));
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempt >= this.opts.maxReconnectAttempts) {
      this.setStatus('error');
      this.errorHandlers.forEach((h) => h(new Error('Max reconnection attempts reached')));
      return;
    }

    this.setStatus('reconnecting');
    const delay = this.opts.reconnectBaseDelay * Math.pow(2, this.reconnectAttempt);
    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }
}
