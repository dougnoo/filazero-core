import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { UserRole } from '@/domain/enums/user-role';
import { setSessionAccessor } from '@/lib/api-client';
import { env } from '@/lib/env';

// ─── Auth Types ─────────────────────────────────────────────────
// Structured to map 1:1 to Cognito session later.

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  cpf?: string;
  role: UserRole;
  unitId?: string;          // health unit (for professionals/managers)
  municipalityId?: string;  // tenant isolation
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  /** Citizen login via CPF + OTP */
  loginWithCPF: (cpf: string, otp: string) => Promise<void>;
  /** Staff login via email + password */
  loginWithCredentials: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  /** Check if current user has a specific role */
  hasRole: (role: UserRole) => boolean;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Mock Users (will be replaced by Cognito) ───────────────────

const MOCK_USERS: Record<string, AuthUser> = {
  citizen: {
    id: 'ctz-001',
    name: 'Maria da Silva',
    cpf: '123.456.789-00',
    role: UserRole.CITIZEN,
    municipalityId: 'mun-001',
  },
  professional: {
    id: 'prof-001',
    name: 'Dr. Carlos Mendes',
    email: 'carlos@ubs.gov.br',
    role: UserRole.PROFESSIONAL,
    unitId: 'unit-001',
    municipalityId: 'mun-001',
  },
  manager: {
    id: 'mgr-001',
    name: 'Ana Coordenadora',
    email: 'ana@saude.gov.br',
    role: UserRole.MANAGER,
    unitId: 'unit-001',
    municipalityId: 'mun-001',
  },
  admin: {
    id: 'adm-001',
    name: 'Admin Sistema',
    email: 'admin@filazero.com',
    role: UserRole.ADMIN,
    municipalityId: 'mun-001',
  },
};

// ─── Provider ───────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithCPF = useCallback(async (_cpf: string, _otp: string) => {
    setIsLoading(true);
    // Simulate network delay — will become Cognito custom auth flow
    await new Promise((r) => setTimeout(r, 800));
    setUser(MOCK_USERS.citizen);
    setIsLoading(false);
  }, []);

  const loginWithCredentials = useCallback(async (_email: string, _password: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const key = role === UserRole.PROFESSIONAL ? 'professional'
      : role === UserRole.MANAGER ? 'manager'
      : role === UserRole.ADMIN ? 'admin'
      : 'citizen';
    setUser(MOCK_USERS[key]);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const hasRole = useCallback((role: UserRole) => {
    return user?.role === role;
  }, [user]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithCPF,
    loginWithCredentials,
    logout,
    hasRole,
  }), [user, isLoading, loginWithCPF, loginWithCredentials, logout, hasRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
