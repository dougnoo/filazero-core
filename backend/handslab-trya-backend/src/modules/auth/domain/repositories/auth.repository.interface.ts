import { Credentials } from '../value-objects/credentials.vo';
import { AuthTokens } from '../value-objects/auth-tokens.vo';
import { User } from '../entities/user.entity';

export interface SignInResult {
  tokens?: AuthTokens;
  user?: Partial<User>;
  challengeName?: string;
  session?: string;
  requiredAttributes?: string[];
}

export interface IAuthRepository {
  /**
   * Autentica um usuário com suas credenciais
   * Pode retornar tokens diretamente ou um challenge que precisa ser completado
   */
  signIn(credentials: Credentials): Promise<SignInResult>;

  /**
   * Completa o challenge NEW_PASSWORD_REQUIRED
   * @param email - Email do usuário
   * @param newPassword - Nova senha
   * @param session - Session do challenge
   * @returns Tokens de autenticação e informações do usuário
   */
  completeNewPasswordChallenge(
    email: string,
    newPassword: string,
    session: string,
  ): Promise<{ tokens: AuthTokens; user: User }>;

  /**
   * Atualiza os tokens usando o refresh token
   * Usa a rotação nativa do Cognito quando habilitada
   * @param refreshToken - Refresh token atual
   * @returns Novos tokens (access token, novo refresh token se rotacionado, id token)
   */
  refreshToken(refreshToken: string): Promise<AuthTokens>;

  /**
   * Realiza logout do usuário
   */
  signOut(accessToken: string): Promise<void>;

  /**
   * Obtém informações do usuário pelo access token
   * @param accessToken - Token de acesso
   * @param idTokenPayload - Payload decodificado do ID Token (opcional, contém grupos)
   */
  getUserInfo(accessToken: string, idTokenPayload?: any): Promise<User>;

  /**
   * Verifica se o token é válido
   */
  verifyToken(accessToken: string): Promise<boolean>;

  /**
   * Gera URL de autorização para OAuth 2.0 Authorization Code Flow
   * @param state - String opcional para manter estado e prevenir CSRF
   * @returns URL de autorização do Cognito
   */
  getAuthorizationUrl?(state?: string): string;

  /**
   * Troca o código de autorização por tokens (OAuth 2.0 Authorization Code Flow)
   * @param code - Código de autorização recebido do Cognito
   * @returns Tokens de autenticação e informações do usuário
   */
  exchangeCodeForTokens?(
    code: string,
  ): Promise<{ tokens: AuthTokens; user: User }>;

  /**
   * Inicia o processo de redefinição de senha
   * @param email - Email do usuário
   * @returns Confirmação de que o processo foi iniciado
   */
  initiateForgotPassword(email: string): Promise<void>;

  /**
   * Confirma a redefinição de senha com código de verificação
   * @param email - Email do usuário
   * @param verificationCode - Código de verificação
   * @param newPassword - Nova senha
   * @returns Confirmação de que a senha foi alterada
   */
  confirmForgotPassword(
    email: string,
    verificationCode: string,
    newPassword: string,
  ): Promise<void>;

  /**
   * Verifica se um usuário existe pelo email
   * @param email - Email do usuário
   * @returns True se o usuário existe, false caso contrário
   */
  userExists(email: string): Promise<boolean>;

  /**
   * Altera a senha de um usuário diretamente (Admin API)
   * @param email - Email do usuário
   * @param newPassword - Nova senha
   * @returns Confirmação de que a senha foi alterada
   */
  changeUserPassword(email: string, newPassword: string): Promise<void>;
}
