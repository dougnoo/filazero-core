/**
 * Environment Configuration — Centralized access to env vars.
 *
 * DEMO_MODE: When true, ALL services use mock data. No backend calls ever.
 * This is the primary flag for live presentations.
 */

interface EnvConfig {
  /** Demo mode — forces all services to use mock data, never calls API */
  DEMO_MODE: boolean;

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

  /** Granular backend flags */
  ENABLE_REAL_TRYA: boolean;
  ENABLE_REAL_PLATFORM: boolean;
  ENABLE_REAL_CHAT: boolean;
}

function bool(val: string | undefined): boolean {
  return val === 'true' || val === '1';
}

export const env: EnvConfig = {
  DEMO_MODE: bool(import.meta.env.VITE_DEMO_MODE),

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

  ENABLE_REAL_TRYA: bool(import.meta.env.VITE_ENABLE_REAL_TRYA),
  ENABLE_REAL_PLATFORM: bool(import.meta.env.VITE_ENABLE_REAL_PLATFORM),
  ENABLE_REAL_CHAT: bool(import.meta.env.VITE_ENABLE_REAL_CHAT),
};

/** Returns true when demo mode is on — everything uses mocks */
export function isDemoMode(): boolean {
  return env.DEMO_MODE;
}

/** Returns true when no real backend URL is configured → use mocks. */
export function isMockMode(): boolean {
  if (isDemoMode()) return true;
  return !env.ENABLE_REAL_BACKEND || !env.TRYA_BACKEND_URL;
}

/** Returns true when trya-backend should use mock data. */
export function isTryaMockMode(): boolean {
  if (isDemoMode()) return true;
  if (env.ENABLE_REAL_TRYA && env.TRYA_BACKEND_URL) return false;
  return isMockMode();
}

/** Returns true when platform-backend should use mock data. */
export function isPlatformMockMode(): boolean {
  if (isDemoMode()) return true;
  if (env.ENABLE_REAL_PLATFORM && env.PLATFORM_BACKEND_URL) return false;
  return isMockMode();
}

/** Returns true when chat-backend should use mock data. */
export function isChatMockMode(): boolean {
  if (isDemoMode()) return true;
  if (env.ENABLE_REAL_CHAT && env.CHAT_HTTP_URL) return false;
  return isMockMode();
}

/** Returns true when auth should use mock provider. */
export function isAuthMockMode(): boolean {
  if (isDemoMode()) return true;
  return !env.ENABLE_REAL_AUTH || !env.COGNITO_POOL_ID || !env.COGNITO_CLIENT_ID;
}