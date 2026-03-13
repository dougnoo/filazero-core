/**
 * Environment Configuration — Centralized access to env vars.
 *
 * Maps to the Trya multi-service architecture:
 * - TRYA_BACKEND  → trya-backend (NestJS — tenant API, journeys, validation)
 * - PLATFORM_BACKEND → platform-backend (NestJS — admin, regulation, scheduling)
 * - CHAT_HTTP → chat-backend REST endpoints (conversation management)
 * - CHAT_WS → chat-backend WebSocket (real-time intake conversation)
 * - COGNITO → AWS Cognito user pool (auth)
 *
 * All values fall back to empty string so the app runs in mock mode
 * when no real backend is configured.
 */

interface EnvConfig {
  /** trya-backend base URL (e.g. https://api.filazero.com/v1) */
  TRYA_BACKEND_URL: string;
  /** platform-backend base URL */
  PLATFORM_BACKEND_URL: string;
  /** chat-backend HTTP base URL */
  CHAT_HTTP_URL: string;
  /** chat-backend WebSocket URL (wss://…) */
  CHAT_WS_URL: string;

  /** AWS Cognito User Pool ID */
  COGNITO_POOL_ID: string;
  /** AWS Cognito App Client ID */
  COGNITO_CLIENT_ID: string;
  /** AWS Cognito domain (for hosted UI, optional) */
  COGNITO_DOMAIN: string;

  /** Feature flags */
  ENABLE_REAL_BACKEND: boolean;
  ENABLE_REAL_AUTH: boolean;
  ENABLE_WEBSOCKET: boolean;

  /** Granular backend flags (override ENABLE_REAL_BACKEND per service) */
  ENABLE_REAL_TRYA: boolean;
  ENABLE_REAL_PLATFORM: boolean;
  ENABLE_REAL_CHAT: boolean;
}

function bool(val: string | undefined): boolean {
  return val === 'true' || val === '1';
}

export const env: EnvConfig = {
  TRYA_BACKEND_URL: import.meta.env.VITE_TRYA_BACKEND_URL ?? '',
  PLATFORM_BACKEND_URL: import.meta.env.VITE_PLATFORM_BACKEND_URL ?? '',
  CHAT_HTTP_URL: import.meta.env.VITE_CHAT_HTTP_URL ?? '',
  CHAT_WS_URL: import.meta.env.VITE_CHAT_WS_URL ?? '',

  COGNITO_POOL_ID: import.meta.env.VITE_COGNITO_POOL_ID ?? '',
  COGNITO_CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID ?? '',
  COGNITO_DOMAIN: import.meta.env.VITE_COGNITO_DOMAIN ?? '',

  ENABLE_REAL_BACKEND: bool(import.meta.env.VITE_ENABLE_REAL_BACKEND),
  ENABLE_REAL_AUTH: bool(import.meta.env.VITE_ENABLE_REAL_AUTH),
  ENABLE_WEBSOCKET: bool(import.meta.env.VITE_ENABLE_WEBSOCKET),
};

/** Returns true when no real backend URL is configured → use mocks. */
export function isMockMode(): boolean {
  return !env.ENABLE_REAL_BACKEND || !env.TRYA_BACKEND_URL;
}
