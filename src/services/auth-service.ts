/**
 * Auth Service — Abstraction layer for identity provider integration.
 *
 * Provides a clean boundary between the app and the identity provider (AWS Cognito).
 * In mock mode, returns simulated tokens and claims.
 * In real mode, delegates to Cognito SDK (aws-amplify or amazon-cognito-identity-js).
 *
 * Cognito JWT custom claims expected:
 *   "custom:role"           → UserRole
 *   "custom:municipality_id" → tenant ID
 *   "custom:unit_id"        → sub-tenant ID (optional)
 *   "cognito:groups"        → ["PROFESSIONAL", "MANAGER", etc.]
 */

import { env, isAuthMockMode } from '@/lib/env';
import { UserRole } from '@/domain/enums/user-role';

// ─── Types ──────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
}

export interface CognitoClaims {
  sub: string;
  email?: string;
  name?: string;
  'custom:cpf'?: string;
  'custom:role'?: string;
  'custom:municipality_id'?: string;
  'custom:unit_id'?: string;
  'cognito:groups'?: string[];
}

export interface AppSession {
  tokens: AuthTokens;
  claims: CognitoClaims;
}

export interface AppUser {
  id: string;
  name: string;
  email?: string;
  cpf?: string;
  role: UserRole;
  municipalityId?: string;
  unitId?: string;
}

// ─── Claims → AppUser mapping ───────────────────────────────────

export function mapClaimsToAppUser(claims: CognitoClaims): AppUser {
  const groups = claims['cognito:groups'] ?? [];
  const customRole = claims['custom:role'];

  // Priority: custom:role claim > cognito:groups > default CITIZEN
  let role = UserRole.CITIZEN;
  if (customRole && Object.values(UserRole).includes(customRole as UserRole)) {
    role = customRole as UserRole;
  } else if (groups.includes('ADMIN')) {
    role = UserRole.ADMIN;
  } else if (groups.includes('MANAGER')) {
    role = UserRole.MANAGER;
  } else if (groups.includes('PROFESSIONAL')) {
    role = UserRole.PROFESSIONAL;
  }

  return {
    id: claims.sub,
    name: claims.name ?? 'Usuário',
    email: claims.email,
    cpf: claims['custom:cpf'],
    role,
    municipalityId: claims['custom:municipality_id'],
    unitId: claims['custom:unit_id'],
  };
}

// ─── Auth Service Interface ─────────────────────────────────────

export interface IAuthService {
  loginWithCPF(cpf: string, otp: string): Promise<AppSession>;
  loginWithCredentials(email: string, password: string): Promise<AppSession>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<AppSession | null>;
  refreshSession(): Promise<AppSession | null>;
}

// ─── Mock Implementation ────────────────────────────────────────

const MOCK_EXPIRY = Date.now() + 3600_000; // 1 hour

function mockTokens(role: string): AuthTokens {
  return {
    accessToken: `mock-access-${role}-${Date.now()}`,
    idToken: `mock-id-${role}-${Date.now()}`,
    refreshToken: `mock-refresh-${role}-${Date.now()}`,
    expiresAt: MOCK_EXPIRY,
  };
}

const MOCK_CLAIMS: Record<string, CognitoClaims> = {
  citizen: {
    sub: 'ctz-001',
    name: 'Maria da Silva',
    'custom:cpf': '123.456.789-00',
    'custom:role': UserRole.CITIZEN,
    'custom:municipality_id': 'mun-001',
  },
  professional: {
    sub: 'prof-001',
    name: 'Dr. Carlos Mendes',
    email: 'carlos@ubs.gov.br',
    'custom:role': UserRole.PROFESSIONAL,
    'custom:municipality_id': 'mun-001',
    'custom:unit_id': 'unit-001',
    'cognito:groups': ['PROFESSIONAL'],
  },
  manager: {
    sub: 'mgr-001',
    name: 'Ana Coordenadora',
    email: 'ana@saude.gov.br',
    'custom:role': UserRole.MANAGER,
    'custom:municipality_id': 'mun-001',
    'custom:unit_id': 'unit-001',
    'cognito:groups': ['MANAGER'],
  },
  admin: {
    sub: 'adm-001',
    name: 'Admin Sistema',
    email: 'admin@filazero.com',
    'custom:role': UserRole.ADMIN,
    'custom:municipality_id': 'mun-001',
    'cognito:groups': ['ADMIN'],
  },
};

let _mockSession: AppSession | null = null;

class MockAuthService implements IAuthService {
  async loginWithCPF(_cpf: string, _otp: string): Promise<AppSession> {
    await new Promise((r) => setTimeout(r, 800));
    const session: AppSession = {
      tokens: mockTokens('citizen'),
      claims: MOCK_CLAIMS.citizen,
    };
    _mockSession = session;
    return session;
  }

  async loginWithCredentials(email: string, _password: string): Promise<AppSession> {
    await new Promise((r) => setTimeout(r, 800));
    // Determine role from email pattern (mock heuristic)
    let key = 'professional';
    if (email.includes('admin')) key = 'admin';
    else if (email.includes('gestor') || email.includes('coordenador') || email.includes('ana@')) key = 'manager';

    const session: AppSession = {
      tokens: mockTokens(key),
      claims: MOCK_CLAIMS[key],
    };
    _mockSession = session;
    return session;
  }

  async logout(): Promise<void> {
    _mockSession = null;
  }

  async getCurrentSession(): Promise<AppSession | null> {
    return _mockSession;
  }

  async refreshSession(): Promise<AppSession | null> {
    if (!_mockSession) return null;
    // Simulate token refresh
    _mockSession = {
      ..._mockSession,
      tokens: { ..._mockSession.tokens, expiresAt: Date.now() + 3600_000 },
    };
    return _mockSession;
  }
}

// ─── Cognito Implementation (stub — activate with ENABLE_REAL_AUTH) ──

class CognitoAuthService implements IAuthService {
  /**
   * Real implementation will use:
   *   import { CognitoUserPool, AuthenticationDetails } from 'amazon-cognito-identity-js';
   *   or @aws-amplify/auth
   *
   * Pool config from env:
   *   UserPoolId: env.COGNITO_POOL_ID
   *   ClientId:   env.COGNITO_CLIENT_ID
   */

  async loginWithCPF(_cpf: string, _otp: string): Promise<AppSession> {
    // Cognito Custom Auth Flow (CUSTOM_AUTH challenge)
    // 1. initiateAuth with CUSTOM_AUTH + cpf as USERNAME
    // 2. respondToAuthChallenge with OTP
    // 3. Extract tokens from AuthenticationResult
    throw new Error('Cognito CPF auth not yet implemented — configure COGNITO_POOL_ID and COGNITO_CLIENT_ID');
  }

  async loginWithCredentials(_email: string, _password: string): Promise<AppSession> {
    // Cognito USER_PASSWORD_AUTH or USER_SRP_AUTH flow
    // 1. authenticateUser with email + password
    // 2. Extract tokens
    throw new Error('Cognito credential auth not yet implemented — configure COGNITO_POOL_ID and COGNITO_CLIENT_ID');
  }

  async logout(): Promise<void> {
    // cognitoUser.globalSignOut() or signOut()
    throw new Error('Cognito logout not yet implemented');
  }

  async getCurrentSession(): Promise<AppSession | null> {
    // cognitoUser.getSession() → extract tokens + decode JWT claims
    throw new Error('Cognito getCurrentSession not yet implemented');
  }

  async refreshSession(): Promise<AppSession | null> {
    // cognitoUser.refreshSession(refreshToken, callback)
    throw new Error('Cognito refreshSession not yet implemented');
  }
}

// ─── Factory ────────────────────────────────────────────────────

export function createAuthService(): IAuthService {
  if (env.ENABLE_REAL_AUTH && env.COGNITO_POOL_ID && env.COGNITO_CLIENT_ID) {
    return new CognitoAuthService();
  }
  return new MockAuthService();
}

/** Singleton instance */
export const authService = createAuthService();
