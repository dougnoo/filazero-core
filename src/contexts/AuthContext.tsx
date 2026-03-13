import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { UserRole } from '@/domain/enums/user-role';
import { setSessionAccessor } from '@/lib/api-client';
import {
  authService,
  mapClaimsToAppUser,
  type AppUser,
  type AuthTokens,
} from '@/services/auth-service';

// ─── Auth Types ─────────────────────────────────────────────────

export type { AppUser as AuthUser };

export interface TenantContext {
  municipalityId: string | null;
  unitId: string | null;
}

export interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** JWT access token (for API calls) */
  accessToken: string | null;
  /** JWT id token (contains claims) */
  idToken: string | null;
  /** Tenant context derived from user claims */
  tenant: TenantContext;
}

interface AuthActions {
  /** Citizen login via CPF + OTP */
  loginWithCPF: (cpf: string, otp: string) => Promise<void>;
  /** Staff login via email + password */
  loginWithCredentials: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  /** Check if current user has a specific role */
  hasRole: (role: UserRole) => boolean;
  /** Force token refresh */
  refreshSession: () => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // start true to check existing session

  const tenant = useMemo<TenantContext>(() => ({
    municipalityId: user?.municipalityId ?? null,
    unitId: user?.unitId ?? null,
  }), [user]);

  // ─── Apply session tokens + user from auth service result ─────
  const applySession = useCallback((tokens: AuthTokens, appUser: AppUser) => {
    setAccessToken(tokens.accessToken);
    setIdToken(tokens.idToken);
    setUser(appUser);
  }, []);

  // ─── Check for existing session on mount ──────────────────────
  useEffect(() => {
    let cancelled = false;
    authService.getCurrentSession().then((session) => {
      if (cancelled) return;
      if (session) {
        const appUser = mapClaimsToAppUser(session.claims);
        applySession(session.tokens, appUser);
      }
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [applySession]);

  const loginWithCPF = useCallback(async (cpf: string, otp: string) => {
    setIsLoading(true);
    try {
      const session = await authService.loginWithCPF(cpf, otp);
      const appUser = mapClaimsToAppUser(session.claims);
      applySession(session.tokens, appUser);
    } finally {
      setIsLoading(false);
    }
  }, [applySession]);

  const loginWithCredentials = useCallback(async (email: string, password: string, _role: UserRole) => {
    setIsLoading(true);
    try {
      const session = await authService.loginWithCredentials(email, password);
      const appUser = mapClaimsToAppUser(session.claims);
      applySession(session.tokens, appUser);
    } finally {
      setIsLoading(false);
    }
  }, [applySession]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setAccessToken(null);
    setIdToken(null);
  }, []);

  const hasRole = useCallback((role: UserRole) => user?.role === role, [user]);

  const refreshSession = useCallback(async () => {
    const session = await authService.refreshSession();
    if (session) {
      const appUser = mapClaimsToAppUser(session.claims);
      applySession(session.tokens, appUser);
    }
  }, [applySession]);

  // ─── Wire up API client session accessor ──────────────────────
  useEffect(() => {
    setSessionAccessor(() => ({
      token: accessToken,
      municipalityId: tenant.municipalityId,
      unitId: tenant.unitId,
    }));
  }, [accessToken, tenant]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    accessToken,
    idToken,
    tenant,
    loginWithCPF,
    loginWithCredentials,
    logout,
    hasRole,
    refreshSession,
  }), [user, isLoading, accessToken, idToken, tenant, loginWithCPF, loginWithCredentials, logout, hasRole, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
