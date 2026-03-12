import { getCurrentTenantName } from '../utils/tenantUtils';

interface LoginRequest {
  email: string;
  password: string;
  tenantName?: string;
}

interface MissingTerm {
  id: string;
  type: 'TERMS_OF_USE' | 'PRIVACY_POLICY';
  version: string;
  s3Url: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  missingTerms?: MissingTerm[];
}

interface NewPasswordRequiredResponse {
  session: string;
  requiredAttributes: string[];
}

interface NewPasswordError extends Error {
  details: unknown;
  session: string;
  isNewPasswordRequired: boolean;
}

interface AuthError {
  message: string;
  status: number;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetResponse {
  message: string;
}

interface VerifyCodeRequest {
  email: string;
  code: string;
}

interface VerifyOtpRequest {
  email: string;
  otpCode: string;
  expectedType: string;
}

interface VerifyCodeResponse {
  message: string;
  token: string;
}


interface CompleteNewPasswordRequest {
  email: string;
  newPassword: string;
  otpCode: string;
  session: string;
}

interface CompleteNewPasswordResponse {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface VerifyCpfRequest {
  cpf: string;
}

interface VerifyCpfResponse {
  canProceed: boolean;
  registrationHash: string;
}

interface VerifyBirthdateRequest {
  registrationHash: string;
  birthDate: string;
}

interface VerifyBirthdateResponse {
  isValid: boolean;
  registrationHash: string;
}

interface CompleteRegistrationRequest {
  registrationHash: string;
  email: string;
  phone?: string;
}

interface CompleteRegistrationResponse {
  message: string;
  email: string;
}

import { RoleEnum } from '../role';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role?: RoleEnum | 'admin';
  groups?: string[];
  tenant?: string;
  avatar?: string;
  permissions?: string[];
  isFirstLogin?: boolean;
  firstLogin?: boolean;
  onboardedAt?: Date | null;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
}

class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  /**
   * Realiza o login do usuário
   * Inclui validação de tenant baseada no hostname
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Obtém o nome do tenant do hostname para validação
      const tenantName = getCurrentTenantName();

      // Monta o payload com tenantName se disponível
      const payload = {
        ...credentials,
        ...(tenantName && { tenantName }),
      };

      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Verifica se é erro de nova senha necessária
        if (errorData.error === 'NEW_PASSWORD_REQUIRED') {
          const newPasswordError = new Error('NEW_PASSWORD_REQUIRED') as NewPasswordError;
          newPasswordError.details = errorData.details;
          newPasswordError.session = errorData.details.session || '';
          newPasswordError.isNewPasswordRequired = true;
          throw newPasswordError;
        }

        // Verifica se é erro de primeiro login com CPF
        if (errorData.error === 'FIRST_LOGIN_CPF') {
          const firstLoginCpfError = new Error('FIRST_LOGIN_CPF') as Error & {
            isFirstLoginCpf: boolean;
            message: string;
          };
          firstLoginCpfError.isFirstLoginCpf = true;
          firstLoginCpfError.message = errorData.message || 'Primeiro login com CPF.';
          throw firstLoginCpfError;
        }

        throw new Error(errorData.message || `Erro na autenticação: ${response.status}`);
      }

      const data: LoginResponse = await response.json();

      // Salva o token no localStorage e cookies
      if (data.accessToken) {
        const currentTime = Date.now();

        // localStorage (para uso no cliente)
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('expiresIn', data.expiresIn.toString());
        localStorage.setItem('tokenTimestamp', currentTime.toString());

        // Cookies (para uso no middleware) - sem secure em desenvolvimento
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${data.expiresIn}; samesite=lax`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${data.expiresIn}; samesite=lax`;
      }

      // Armazena termos pendentes em sessionStorage para redirecionamento pós-login
      if (data.missingTerms && data.missingTerms.length > 0) {
        sessionStorage.setItem('pendingTerms', JSON.stringify(data.missingTerms));
      } else {
        sessionStorage.removeItem('pendingTerms');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Realiza logout do usuário
   * Remove apenas os dados de autenticação, preservando outros dados do localStorage
   */
  logout(): void {
    try {
      // Remove apenas as chaves relacionadas à autenticação
      if (typeof localStorage !== 'undefined') {
        const authKeys = [
          'accessToken',
          'refreshToken',
          'expiresIn',
          'tokenTimestamp',
          'auth_token', // fallback
          'refresh_token', // fallback
        ];

        authKeys.forEach(key => {
          localStorage.removeItem(key);
        });
      }

      // Remove dos cookies - múltiplas tentativas para garantir limpeza
      if (typeof document !== 'undefined') {
        // Remove com diferentes configurações para garantir limpeza completa
        const cookieOptions = [
          'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
          'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
          'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax',
          'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax',
          'accessToken=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT',
          'refreshToken=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT',
        ];

        cookieOptions.forEach(cookie => {
          document.cookie = cookie;
        });
      }
    } catch {
      // Mesmo com erro, tenta limpar o que for possível
      if (typeof localStorage !== 'undefined') {
        const authKeys = [
          'accessToken',
          'refreshToken',
          'expiresIn',
          'tokenTimestamp',
          'auth_token',
          'refresh_token',
        ];

        authKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch {
            // Ignora erros individuais
          }
        });
      }
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const expiresIn = localStorage.getItem('expiresIn');

    if (!token || !expiresIn) {
      return false;
    }

    // Verifica se o token não expirou
    // expiresIn é a duração em segundos, então calculamos o timestamp de expiração
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    if (!tokenTimestamp) {
      return false;
    }

    const expirationTime = parseInt(tokenTimestamp) + (parseInt(expiresIn) * 1000);
    const currentTime = Date.now();

    return currentTime < expirationTime;
  }

  /**
   * Obtém o token de acesso atual
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Obtém o token de refresh atual
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Solicita reset de senha
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao solicitar reset de senha: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica código de reset de senha
   */
  async verifyPasswordResetCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao verificar código: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }


  /**
   * Reenvia código de verificação
   */
  async resendPasswordResetCode(email: string): Promise<PasswordResetResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/resend-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao reenviar código: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica código OTP para nova senha
   */
  async verifyOtpForNewPassword(data: VerifyOtpRequest): Promise<VerifyCodeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao verificar código OTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Completa o processo de nova senha
   */
  async completeNewPassword(data: CompleteNewPasswordRequest): Promise<CompleteNewPasswordResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/complete-new-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao completar nova senha: ${response.status}`);
      }

      const result = await response.json();

      // Se retornou tokens, salva no localStorage e cookies
      if (result.accessToken) {
        const currentTime = Date.now();

        // localStorage (para uso no cliente)
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        localStorage.setItem('expiresIn', result.expiresIn.toString());
        localStorage.setItem('tokenTimestamp', currentTime.toString());

        // Cookies (para uso no middleware)
        document.cookie = `accessToken=${result.accessToken}; path=/; max-age=${result.expiresIn}; samesite=lax`;
        document.cookie = `refreshToken=${result.refreshToken}; path=/; max-age=${result.expiresIn}; samesite=lax`;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Solicita reset de senha (forgot password)
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao solicitar reset de senha: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reseta a senha com código de verificação
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao resetar senha: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtém o perfil do usuário autenticado
   */
  async getUserProfile(): Promise<UserProfile> {
    if (typeof window === 'undefined') {
      throw new Error('getUserProfile deve ser chamado no lado do cliente');
    }

    const token = this.getAccessToken();

    if (!token) {
      throw new Error('Token de acesso não encontrado');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        this.logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.message || `Erro ao buscar perfil do usuário: ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();

      const groups = data.groups ?? [];
      const roleFromGroups = groups.includes('SUPER_ADMIN')
        ? 'SUPER_ADMIN'
        : groups.includes('ADMIN')
          ? 'ADMIN'
          : groups.includes('ADMIN_RH') || groups.includes('HR')
            ? 'ADMIN_RH'
            : groups.includes('DOCTOR')
              ? 'DOCTOR'
              : groups.includes('BENEFICIARY')
                ? 'BENEFICIARY'
                : null;

      return {
        id: data.id ?? '',
        email: data.email ?? '',
        name: data.name ?? '',
        role: data.role ?? data.roles?.[0] ?? roleFromGroups,
        groups,
        tenant: data.tenant,
        avatar: data.avatar,
        permissions: data.permissions ?? [],
        isFirstLogin: data.isFirstLogin ?? data.firstLogin ?? false,
        firstLogin: data.firstLogin ?? data.isFirstLogin ?? false,
        onboardedAt: data.onboardedAt ?? null,
        preferences: {
          theme: data.preferences?.theme ?? 'default',
          language: data.preferences?.language ?? 'pt-BR',
          notifications:
            typeof data.preferences?.notifications === 'boolean'
              ? data.preferences.notifications
              : true,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica CPF para iniciar cadastro
   */
  async verifyCpf(data: VerifyCpfRequest): Promise<VerifyCpfResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-cpf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Trata erro específico de CPF não encontrado
        if (errorData.error === 'CPF_NOT_FOUND_ERROR' || response.status === 404) {
          throw new Error('CPF não encontrado. Verifique se o CPF está correto ou entre em contato com o suporte.');
        }
        
        throw new Error(errorData.message || `Erro ao verificar CPF: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica data de nascimento
   */
  async verifyBirthdate(data: VerifyBirthdateRequest): Promise<VerifyBirthdateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-birthdate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao verificar data de nascimento: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Completa o cadastro com email e telefone
   */
  async completeRegistration(data: CompleteRegistrationRequest): Promise<CompleteRegistrationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao completar cadastro: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();

/**
 * Remove os termos pendentes do sessionStorage
 * Chamado após o aceite dos termos
 */
export function clearPendingTerms(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('pendingTerms');
  }
}

export type {
  LoginRequest,
  LoginResponse,
  MissingTerm,
  NewPasswordRequiredResponse,
  AuthError,
  PasswordResetRequest,
  PasswordResetResponse,
  VerifyCodeRequest,
  VerifyOtpRequest,
  VerifyCodeResponse,
  CompleteNewPasswordRequest,
  CompleteNewPasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyCpfRequest,
  VerifyCpfResponse,
  VerifyBirthdateRequest,
  VerifyBirthdateResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  UserProfile
};
