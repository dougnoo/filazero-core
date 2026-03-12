import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  GetUserCommand,
  UpdateUserAttributesCommand,
  AttributeType,
  AdminListGroupsForUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  ChangePasswordCommand,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { AuthTokens } from '../../domain/entities/auth-tokens.entity';
import { AuthenticationError } from '../../domain/errors/authentication.error';
import { UserNotConfirmedError } from '../../domain/errors/user-not-confirmed.error';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists.error';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { InvalidVerificationCodeError } from '../../domain/errors/invalid-verification-code.error';
import { CodeExpiredError } from '../../domain/errors/code-expired.error';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class CognitoAuthRepository implements IAuthRepository {
  private readonly logger = new Logger(CognitoAuthRepository.name);
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;
  private clientSecret?: string;

  constructor(private configService: ConfigService) {
    // Cognito pode estar em região diferente (ex: us-east-1) do restante da app (ex: sa-east-1)
    const cognitoRegion =
      this.configService.get<string>('aws.cognito.region') || 'us-east-1';

    // Obter credenciais opcionais da configuração
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    this.cognitoClient = new CognitoIdentityProviderClient({
      region: cognitoRegion,
      // Passar o profile se estiver configurado (necessário para AWS SSO)
      ...(profile ? { profile } : {}),
      // Só passar credenciais explicitamente se ambas estiverem configuradas
      // Caso contrário, o SDK detectará automaticamente (SSO, env vars, IAM role, etc)
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });

    const userPoolId = this.configService.get<string>('aws.cognito.userPoolId');
    const clientId = this.configService.get<string>('aws.cognito.clientId');
    const clientSecret = this.configService.get<string>(
      'aws.cognito.clientSecret',
    );

    if (!userPoolId || !clientId) {
      throw new Error('Cognito configuration is not complete');
    }

    this.userPoolId = userPoolId;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Calculate SECRET_HASH for Cognito operations
   * Required when App Client has a secret configured
   */
  private calculateSecretHash(username: string): string | undefined {
    if (!this.clientSecret) {
      return undefined;
    }

    const crypto = require('crypto');
    const message = username + this.clientId;
    const hmac = crypto.createHmac('sha256', this.clientSecret);
    hmac.update(message);
    return hmac.digest('base64');
  }

  /**
   * Find username by email since user pool doesn't support email login
   */
  private async findUsernameByEmail(email: string): Promise<string> {
    const command = new ListUsersCommand({
      UserPoolId: this.userPoolId,
      Filter: `email = "${email}"`,
    });

    const response = await this.cognitoClient.send(command);

    if (!response.Users || response.Users.length === 0) {
      throw new UserNotFoundError();
    }

    return response.Users[0].Username!;
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{
    tokens?: AuthTokens;
    user?: User;
    challengeName?: string;
    session?: string;
  }> {
    try {
      // Find username by email since user pool doesn't support email login
      const username = await this.findUsernameByEmail(email);

      const authParameters: Record<string, string> = {
        USERNAME: username,
        PASSWORD: password,
      };

      const secretHash = this.calculateSecretHash(username);
      if (secretHash) {
        authParameters.SECRET_HASH = secretHash;
      }

      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        AuthParameters: authParameters,
      });

      const response = await this.cognitoClient.send(command);

      // Check if there's a challenge (e.g., NEW_PASSWORD_REQUIRED)
      if (response.ChallengeName) {
        return {
          challengeName: response.ChallengeName,
          session: response.Session,
        };
      }

      if (!response.AuthenticationResult) {
        throw new AuthenticationError('Falha na autenticação');
      }

      const { AccessToken, RefreshToken, ExpiresIn } =
        response.AuthenticationResult;

      if (!AccessToken || !RefreshToken || !ExpiresIn) {
        throw new AuthenticationError('Resposta de autenticação incompleta');
      }

      const tokens = new AuthTokens(AccessToken, RefreshToken, ExpiresIn);

      const user = await this.getCurrentUser(tokens.accessToken);

      return { tokens, user };
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const authParameters: Record<string, string> = {
        REFRESH_TOKEN: refreshToken,
      };

      // Note: For REFRESH_TOKEN_AUTH, we don't need username, so SECRET_HASH is not required
      // But if Cognito requires it, we would need to store the username with the refresh token

      const command = new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: this.clientId,
        AuthParameters: authParameters,
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new AuthenticationError('Falha ao renovar token');
      }

      const { AccessToken, ExpiresIn } = response.AuthenticationResult;

      if (!AccessToken || !ExpiresIn) {
        throw new AuthenticationError(
          'Resposta de renovação de token incompleta',
        );
      }

      return new AuthTokens(AccessToken, refreshToken, ExpiresIn);
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async completeNewPassword(
    email: string,
    session: string,
    newPassword: string,
  ): Promise<{ tokens: AuthTokens; user: User }> {
    try {
      this.logger.log(
        `[completeNewPassword] Completando challenge NEW_PASSWORD_REQUIRED para ${email}`,
      );

      const challengeResponses: Record<string, string> = {
        USERNAME: email,
        NEW_PASSWORD: newPassword,
      };

      // Add SECRET_HASH if client secret is configured
      const secretHash = this.calculateSecretHash(email);
      if (secretHash) {
        challengeResponses.SECRET_HASH = secretHash;
      }

      const command = new RespondToAuthChallengeCommand({
        ClientId: this.clientId,
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: session,
        ChallengeResponses: challengeResponses,
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new AuthenticationError('Falha ao completar nova senha');
      }

      const { AccessToken, RefreshToken, ExpiresIn } =
        response.AuthenticationResult;

      if (!AccessToken || !RefreshToken || !ExpiresIn) {
        throw new AuthenticationError('Resposta de autenticação incompleta');
      }

      const tokens = new AuthTokens(AccessToken, RefreshToken, ExpiresIn);
      const user = await this.getCurrentUser(tokens.accessToken);

      this.logger.log(
        `[completeNewPassword] Challenge completado com sucesso para ${email}`,
      );

      return { tokens, user };
    } catch (error) {
      this.logger.error(
        `[completeNewPassword] Erro ao completar challenge para ${email}:`,
        error,
      );
      this.handleCognitoError(error);
    }
  }

  async getCurrentUser(accessToken: string): Promise<User> {
    try {
      // Get user details
      const getUserCommand = new GetUserCommand({
        AccessToken: accessToken,
      });

      const userResponse = await this.cognitoClient.send(getUserCommand);

      // Get user groups
      const username = userResponse.Username;
      if (!username) {
        throw new AuthenticationError('Username não encontrado');
      }

      const listGroupsCommand = new AdminListGroupsForUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      });

      const groupsResponse = await this.cognitoClient.send(listGroupsCommand);

      return UserMapper.toDomain(userResponse, groupsResponse.Groups);
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async updateProfile(
    userId: string,
    attributes: Record<string, string>,
  ): Promise<User> {
    // Note: Cognito's UpdateUserAttributesCommand requires an AccessToken, not userId
    // The userId parameter is treated as the accessToken for Cognito operations
    // This will be called from use cases with the user's access token from the request context
    try {
      const userAttributes: AttributeType[] = Object.entries(attributes).map(
        ([key, value]) => ({
          Name: key,
          Value: value,
        }),
      );

      const command = new UpdateUserAttributesCommand({
        AccessToken: userId, // In Cognito context, we use the access token here
        UserAttributes: userAttributes,
      });

      await this.cognitoClient.send(command);

      return this.getCurrentUser(userId);
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async userExists(email: string): Promise<boolean> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });

      await this.cognitoClient.send(command);
      return true;
    } catch (error) {
      if (error.name === 'UserNotFoundException') {
        return false;
      }
      this.handleCognitoError(error);
    }
  }

  async changeUserPassword(email: string, newPassword: string): Promise<void> {
    try {
      const command = new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        Password: newPassword,
        Permanent: true,
      });

      await this.cognitoClient.send(command);
      this.logger.log(`Password changed successfully for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to change password for ${email}:`, error);
      this.handleCognitoError(error);
    }
  }

  async changePasswordAuthenticated(
    accessToken: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const command = new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: currentPassword,
        ProposedPassword: newPassword,
      });

      await this.cognitoClient.send(command);
      this.logger.log(`Authenticated user password changed successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to change password for authenticated user:`,
        error,
      );
      this.handleCognitoError(error);
    }
  }

  private handleCognitoError(error: any): never {
    const timestamp = new Date().toISOString();

    if (error.name === 'NotAuthorizedException') {
      this.logger.warn(`Authentication failed: ${error.name} at ${timestamp}`);
      throw new AuthenticationError('Credenciais inválidas');
    }
    if (error.name === 'UserNotConfirmedException') {
      this.logger.warn(`User not confirmed: ${error.name} at ${timestamp}`);
      throw new UserNotConfirmedError();
    }
    if (error.name === 'UserNotFoundException') {
      this.logger.warn(`User not found: ${error.name} at ${timestamp}`);
      throw new UserNotFoundError();
    }
    if (error.name === 'UsernameExistsException') {
      this.logger.warn(`User already exists: ${error.name} at ${timestamp}`);
      throw new UserAlreadyExistsError();
    }
    if (error.name === 'CodeMismatchException') {
      this.logger.warn(
        `Invalid verification code: ${error.name} at ${timestamp}`,
      );
      throw new InvalidVerificationCodeError();
    }
    if (error.name === 'ExpiredCodeException') {
      this.logger.warn(
        `Verification code expired: ${error.name} at ${timestamp}`,
      );
      throw new CodeExpiredError();
    }
    if (error.name === 'InvalidPasswordException') {
      this.logger.warn(
        `Invalid password format: ${error.name} at ${timestamp}`,
      );
      throw new AuthenticationError(
        'Senha não atende aos requisitos de complexidade',
      );
    }
    if (error.name === 'LimitExceededException') {
      this.logger.warn(`Rate limit exceeded: ${error.name} at ${timestamp}`);
      throw new AuthenticationError(
        'Muitas tentativas. Tente novamente mais tarde',
      );
    }

    // Re-throw domain errors
    if (
      error instanceof AuthenticationError ||
      error instanceof UserNotConfirmedError ||
      error instanceof UserAlreadyExistsError ||
      error instanceof UserNotFoundError ||
      error instanceof InvalidVerificationCodeError ||
      error instanceof CodeExpiredError
    ) {
      throw error;
    }

    // Unknown error
    this.logger.error(
      `Unexpected Cognito error: ${error.name || 'Unknown'} at ${timestamp}`,
      error.stack,
    );
    throw new AuthenticationError('Erro ao processar requisição');
  }
}
