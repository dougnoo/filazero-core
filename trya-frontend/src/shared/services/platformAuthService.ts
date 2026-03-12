/**
 * Platform Auth Service
 * 
 * Authentication service for the Platform API used by the medical module.
 * Handles sign-in, token storage, and authentication state.
 */

import { platformApi } from './platformApi';
import { PLATFORM_STORAGE_KEYS, PLATFORM_API_BASE_URL } from '../config/platformApi.config';

interface SignInRequest {
  email: string;
  password: string;
}

interface SignInResponse {
  accessToken: string;
  expiresIn: number;
}

interface NewPasswordRequiredResponse {
  session: string;
  message: string;
}

interface VerifyOtpRequest {
  email: string;
  otpCode: string;
  session: string;
}

interface VerifyOtpResponse {
  message: string;
}

interface CompleteNewPasswordRequest {
  email: string;
  newPassword: string;
  session: string;
}

interface CompleteNewPasswordResponse {
  accessToken: string;
  expiresIn: number;
  message: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ConfirmForgotPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
}

interface ConfirmForgotPasswordResponse {
  message: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  crm?: string;
  specialty?: string;
  profilePictureUrl?: string;
}

interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  crm?: string;
  specialty?: string;
}

interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface UpdatePasswordRequest {
  newPassword: string;
}

// SessionStorage key for first access flow
const FIRST_ACCESS_SESSION_KEY = 'platform_first_access_session';

/**
 * Platform Auth Service
 */
class PlatformAuthService {
  /**
   * Sign in to Platform API
   * Handles NEW_PASSWORD_REQUIRED (status 428) response
   */
  async signIn(credentials: SignInRequest): Promise<SignInResponse> {
    const response = await fetch(`${PLATFORM_API_BASE_URL}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    // Handle NEW_PASSWORD_REQUIRED (status 428)
    if (response.status === 428) {
      const data: NewPasswordRequiredResponse = await response.json();
      const error = new Error('NEW_PASSWORD_REQUIRED') as Error & { 
        isNewPasswordRequired: boolean; 
        session: string;
      };
      error.isNewPasswordRequired = true;
      error.session = data.session;
      throw error;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message || 
        `Erro na autenticação: ${response.status}`
      );
    }

    const data: SignInResponse = await response.json();

    // Store token in localStorage
    if (data.accessToken) {
      localStorage.setItem(PLATFORM_STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    }

    return data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem(PLATFORM_STORAGE_KEYS.ACCESS_TOKEN);
    return !!token && token !== 'undefined' && token !== 'null';
  }

  /**
   * Logout user
   * Removes platform access token from localStorage
   */
  logout(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(PLATFORM_STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem(PLATFORM_STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Verify OTP code for first access
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const response = await platformApi.post<VerifyOtpResponse>(
      '/auth/verify-otp',
      data,
      'Erro ao verificar código OTP'
    );
    return response;
  }

  /**
   * Complete new password setup for first access
   * Stores token in localStorage and session in sessionStorage
   */
  async completeNewPassword(data: CompleteNewPasswordRequest): Promise<CompleteNewPasswordResponse> {
    const response = await platformApi.post<CompleteNewPasswordResponse>(
      '/auth/complete-new-password',
      data,
      'Erro ao completar nova senha'
    );

    // Store token in localStorage
    if (response.accessToken) {
      localStorage.setItem(PLATFORM_STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    }

    return response;
  }

  /**
   * Store first access session in sessionStorage
   */
  storeFirstAccessSession(session: string): void {
    if (typeof window === 'undefined') return;
    
    sessionStorage.setItem(FIRST_ACCESS_SESSION_KEY, session);
  }

  /**
   * Get first access session from sessionStorage
   */
  getFirstAccessSession(): string | null {
    if (typeof window === 'undefined') return null;
    
    return sessionStorage.getItem(FIRST_ACCESS_SESSION_KEY);
  }

  /**
   * Clear first access session from sessionStorage
   */
  clearFirstAccessSession(): void {
    if (typeof window === 'undefined') return;
    
    sessionStorage.removeItem(FIRST_ACCESS_SESSION_KEY);
  }

  /**
   * Request password reset (forgot password)
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await platformApi.post<ForgotPasswordResponse>(
      '/auth/forgot-password',
      data,
      'Erro ao solicitar recuperação de senha'
    );
    return response;
  }

  /**
   * Confirm password reset with verification code
   */
  async confirmForgotPassword(data: ConfirmForgotPasswordRequest): Promise<ConfirmForgotPasswordResponse> {
    const response = await platformApi.post<ConfirmForgotPasswordResponse>(
      '/auth/confirm-forgot-password',
      data,
      'Erro ao confirmar nova senha'
    );
    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await platformApi.get<UserProfile>(
      '/auth/me',
      'Erro ao buscar perfil do usuário'
    );
    return response;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await platformApi.patch<UpdateProfileResponse>(
      '/auth/profile',
      data,
      'Erro ao atualizar perfil'
    );
    return response;
  }

  /**
   * Change password for authenticated user (requires current password)
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await platformApi.post<void>(
      '/auth/change-password',
      data,
      'Erro ao alterar senha'
    );
  }

  /**
   * Update password for authenticated user (without current password)
   */
  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    await platformApi.post<void>(
      '/auth/update-password',
      data,
      'Erro ao alterar senha'
    );
  }
}

export const platformAuthService = new PlatformAuthService();
export type { 
  SignInRequest, 
  SignInResponse, 
  NewPasswordRequiredResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  CompleteNewPasswordRequest,
  CompleteNewPasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ConfirmForgotPasswordRequest,
  ConfirmForgotPasswordResponse,
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  UpdatePasswordRequest,
};
