/**
 * Centralized API Client — Unified HTTP layer for all backends.
 *
 * Features:
 * - JWT injection from auth session
 * - Municipality/tenant header propagation
 * - Standardized error handling via AppError
 * - Backend-specific factory (trya, platform, chat)
 *
 * Compatible with:
 * - trya-backend (NestJS)
 * - platform-backend (NestJS)
 * - chat-backend (Express/NestJS)
 */

import { env } from './env';
import { AppError, ErrorCode, statusToErrorCode } from './errors';

// ─── Types ──────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Override default timeout (ms). Default: 30_000 */
  timeout?: number;
  /** Skip auth header injection */
  skipAuth?: boolean;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

// ─── Session accessor (injected by AuthContext) ─────────────────

type SessionAccessor = () => {
  token: string | null;
  municipalityId: string | null;
  unitId: string | null;
};

let _getSession: SessionAccessor = () => ({
  token: null,
  municipalityId: null,
  unitId: null,
});

/** Called once by AuthProvider to wire up session access. */
export function setSessionAccessor(accessor: SessionAccessor): void {
  _getSession = accessor;
}

// ─── Dev-mode debug logger ──────────────────────────────────────

const isDev = import.meta.env.DEV;

function logRequest(method: string, url: string, headers: Headers, body?: unknown) {
  if (!isDev) return;
  console.group(`[api-client] → ${method} ${url}`);
  console.log('Headers:', Object.fromEntries(headers.entries()));
  if (body) console.log('Body:', body);
  console.groupEnd();
}

function logResponse(method: string, url: string, status: number, data: unknown, durationMs: number) {
  if (!isDev) return;
  const icon = status >= 200 && status < 300 ? '✅' : '❌';
  console.group(`[api-client] ${icon} ${method} ${url} — ${status} (${durationMs}ms)`);
  console.log('Data:', data);
  console.groupEnd();
}

function logError(method: string, url: string, error: unknown, durationMs: number) {
  if (!isDev) return;
  console.group(`[api-client] ❌ ${method} ${url} — ERROR (${durationMs}ms)`);
  console.error(error);
  console.groupEnd();
}

// ─── Core request function ──────────────────────────────────────

async function request<T>(baseUrl: string, path: string, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { body, timeout = 30_000, skipAuth = false, headers: extraHeaders, ...fetchOpts } = opts;

  const session = _getSession();

  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  if (!skipAuth && session.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  // Multi-tenant headers (matches trya-backend middleware)
  if (session.municipalityId) {
    headers.set('X-Municipality-Id', session.municipalityId);
  }
  if (session.unitId) {
    headers.set('X-Unit-Id', session.unitId);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const url = `${baseUrl}${path}`;
  const method = fetchOpts.method ?? 'GET';
  logRequest(method, url, headers, body);

  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      ...fetchOpts,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);
    const durationMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      let details: unknown;
      try { details = await response.json(); } catch { /* empty */ }
      logResponse(method, url, response.status, details, durationMs);
      throw new AppError(
        statusToErrorCode(response.status),
        (details as { message?: string })?.message ?? `Request failed: ${response.status}`,
        response.status,
        details,
      );
    }

    const data = response.status === 204 ? (null as T) : ((await response.json()) as T);
    logResponse(method, url, response.status, data, durationMs);
    return { data, status: response.status, headers: response.headers };
  } catch (err) {
    clearTimeout(timer);
    const durationMs = Math.round(performance.now() - startTime);
    if (err instanceof AppError) throw err;
    logError(method, url, err, durationMs);
    if ((err as Error).name === 'AbortError') {
      throw new AppError(ErrorCode.TIMEOUT, 'Request timed out');
    }
    throw new AppError(ErrorCode.NETWORK_ERROR, (err as Error).message ?? 'Network error');
  }
}

// ─── Backend-specific clients ───────────────────────────────────

function createClient(baseUrl: string) {
  return {
    get: <T>(path: string, opts?: RequestOptions) =>
      request<T>(baseUrl, path, { ...opts, method: 'GET' }),
    post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
      request<T>(baseUrl, path, { ...opts, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
      request<T>(baseUrl, path, { ...opts, method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
      request<T>(baseUrl, path, { ...opts, method: 'PATCH', body }),
    delete: <T>(path: string, opts?: RequestOptions) =>
      request<T>(baseUrl, path, { ...opts, method: 'DELETE' }),
  };
}

/** trya-backend — journeys, intakes, validation, clinical data */
export const tryaApi = createClient(env.TRYA_BACKEND_URL);

/** platform-backend — admin, regulation, scheduling, analytics */
export const platformApi = createClient(env.PLATFORM_BACKEND_URL);

/** chat-backend — conversation management (HTTP endpoints) */
export const chatApi = createClient(env.CHAT_HTTP_URL);
