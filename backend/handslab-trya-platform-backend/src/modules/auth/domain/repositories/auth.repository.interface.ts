import { AuthTokens } from '../entities/auth-tokens.entity';
import { User } from '../entities/user.entity';

export interface IAuthRepository {
  signIn(
    email: string,
    password: string,
  ): Promise<{
    tokens?: AuthTokens;
    user?: User;
    challengeName?: string;
    session?: string;
  }>;

  refreshToken(refreshToken: string): Promise<AuthTokens>;

  completeNewPassword(
    email: string,
    session: string,
    newPassword: string,
  ): Promise<{ tokens: AuthTokens; user: User }>;

  getCurrentUser(accessToken: string): Promise<User>;

  updateProfile(
    userId: string,
    attributes: Record<string, string>,
  ): Promise<User>;

  /**
   * Verifica se um usuário existe pelo email
   */
  userExists(email: string): Promise<boolean>;

  /**
   * Altera a senha de um usuário diretamente usando Admin API
   */
  changeUserPassword(email: string, newPassword: string): Promise<void>;

  /**
   * Altera a senha do usuário autenticado (requer senha atual)
   */
  changePasswordAuthenticated(
    accessToken: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;
}

export const AUTH_REPOSITORY_TOKEN = Symbol('AUTH_REPOSITORY_TOKEN');
