import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  GetUserCommand,
  AuthFlowType,
  RespondToAuthChallengeCommand,
  ChallengeNameType,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';
import axios from 'axios';
import {
  IAuthRepository,
  SignInResult,
} from '../../domain/repositories/auth.repository.interface';
import { Credentials } from '../../domain/value-objects/credentials.vo';
import { AuthTokens } from '../../domain/value-objects/auth-tokens.vo';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { UserNotConfirmedError } from '../../domain/errors/user-not-confirmed.error';
import { AuthenticationError } from '../../domain/errors/authentication.error';

@Injectable()
export class CognitoAuthRepository implements IAuthRepository {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly region: string;
  private readonly cognitoDomain: string;
  private readonly redirectUri: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly userMapper: UserMapper,
    private readonly jwtService: JwtService,
  ) {
    this.region = this.configService.get<string>('aws.cognito.region')!;
    this.userPoolId = this.configService.get<string>('aws.cognito.userPoolId')!;
    this.clientId = this.configService.get<string>('aws.cognito.clientId')!;
    this.clientSecret =
      this.configService.get<string>('aws.cognito.clientSecret') || '';
    this.cognitoDomain = this.configService.get<string>('aws.cognito.domain')!;
    this.redirectUri = this.configService.get<string>(
      'aws.cognito.redirectUri',
    )!;

    // Obter credenciais opcionais da configuração
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );


    const cognitoEndpointUrl = this.configService.get<string>(
      'aws.cognito.endpointUrl',
    );

    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.region,
      ...(cognitoEndpointUrl
        ? {
            endpoint: cognitoEndpointUrl,
            credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
          }
        : {
            ...(profile ? { profile } : {}),
            ...(accessKeyId && secretAccessKey
              ? {
                  credentials: {
                    accessKeyId,
                    secretAccessKey,
                  },
                }
              : {}),
          }),
    });
  }

  /**
   * Gera o SECRET_HASH necessário para autenticação com o Cognito
   */
  private generateSecretHash(username: string): string {
    if (!this.clientSecret) {
      return '';
    }
    return createHmac('sha256', this.clientSecret)
      .update(username + this.clientId)
      .digest('base64');
  }

  /**
   * Gera a URL de autorização do Cognito para o Authorization Code Flow
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: 'openid email phone profile aws.cognito.signin.user.admin',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://${this.cognitoDomain}/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Troca o código de autorização por tokens (Authorization Code Flow)
   */
  async exchangeCodeForTokens(
    code: string,
  ): Promise<{ tokens: AuthTokens; user: User }> {
    try {
      const tokenEndpoint = `https://${this.cognitoDomain}/oauth2/token`;

      console.log(
        '[exchangeCodeForTokens] Iniciando troca de código por tokens...',
      );
      console.log('[exchangeCodeForTokens] Endpoint:', tokenEndpoint);
      console.log(
        '[exchangeCodeForTokens] Code:',
        code?.substring(0, 20) + '...',
      );

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        code: code,
        redirect_uri: this.redirectUri,
      });

      // Adiciona client_secret se estiver configurado
      if (this.clientSecret) {
        console.log('[exchangeCodeForTokens] Client secret configurado');
        params.append('client_secret', this.clientSecret);
      } else {
        console.log(
          '[exchangeCodeForTokens] ATENÇÃO: Client secret não configurado',
        );
      }

      const response = await axios.post(tokenEndpoint, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('[exchangeCodeForTokens] Resposta recebida do Cognito');

      const { access_token, refresh_token, id_token, expires_in, token_type } =
        response.data;

      console.log('[exchangeCodeForTokens] Tokens:', {
        access_token_length: access_token?.length || 0,
        refresh_token_length: refresh_token?.length || 0,
        id_token_length: id_token?.length || 0,
        expires_in,
        token_type,
      });

      if (!access_token || !refresh_token || !id_token) {
        throw new AuthenticationError('Tokens inválidos recebidos');
      }

      // Obter informações do usuário
      console.log('[exchangeCodeForTokens] Buscando informações do usuário...');

      // Decodificar ID Token para obter grupos (se existirem)
      const idTokenPayload = this.jwtService.decode(id_token);

      const user = await this.getUserInfo(access_token, idTokenPayload);

      // Somente BENEFICIARY pode ter refresh token
      const isBeneficiary = user.role === 'BENEFICIARY';
      const finalRefreshToken = isBeneficiary ? refresh_token : '';

      console.log(
        '[exchangeCodeForTokens] Role:',
        user.role,
        '| Refresh token:',
        isBeneficiary ? 'permitido' : 'bloqueado',
      );

      const tokens = AuthTokens.create(
        access_token,
        finalRefreshToken,
        id_token,
        expires_in || 3600,
      );

      return { tokens, user };
    } catch (error: any) {
      console.error('[exchangeCodeForTokens] Erro:', {
        name: error.name,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 400) {
        throw new InvalidCredentialsError(
          'Código de autorização inválido ou expirado',
        );
      }
      if (
        error instanceof AuthenticationError ||
        error instanceof InvalidCredentialsError
      ) {
        throw error;
      }
      throw new AuthenticationError(
        `Erro ao trocar código por tokens: ${error.message}`,
      );
    }
  }

  async signIn(credentials: Credentials): Promise<SignInResult> {
    try {
      // Tentar autenticar com o email como username
      let authParams: any = {
        USERNAME: credentials.email,
        PASSWORD: credentials.password,
      };

      let command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: this.clientId,
        AuthParameters: authParams,
      });

      let response;
      try {
        console.log('[signIn] Tentando login com email:', credentials.email);
        response = await this.cognitoClient.send(command);
      } catch (error) {
        console.log('[signIn] Erro ao tentar com email:', error.name);
        // Se falhar, tentar com o username extraído do email (parte antes do @)
        if (error.name === 'UserNotFoundException' || error.name === 'NotAuthorizedException') {
          const usernameFromEmail = credentials.email.split('@')[0];
          console.log('[signIn] Tentando com username extraído:', usernameFromEmail);
          authParams.USERNAME = usernameFromEmail;
          command = new InitiateAuthCommand({
            AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
            ClientId: this.clientId,
            AuthParameters: authParams,
          });
          response = await this.cognitoClient.send(command);
        } else {
          throw error;
        }
      }

      // Verificar se é um challenge NEW_PASSWORD_REQUIRED
      if (response.ChallengeName === ChallengeNameType.NEW_PASSWORD_REQUIRED) {
        console.log('[signIn] Challenge NEW_PASSWORD_REQUIRED detectado');

        // Extrair atributos obrigatórios do ChallengeParameters
        const requiredAttributes = response.ChallengeParameters
          ?.requiredAttributes
          ? response.ChallengeParameters.requiredAttributes
              .split(',')
              .map((attr) => attr.trim())
          : [];

        const name = response.ChallengeParameters?.userAttributes
          ? JSON.parse(response.ChallengeParameters.userAttributes).name
          : undefined;

        return {
          challengeName: response.ChallengeName,
          session: response.Session,
          requiredAttributes,
          user: {
            name,
          },
        };
      }

      // Fluxo normal de autenticação
      if (!response.AuthenticationResult) {
        throw new AuthenticationError('Falha na autenticação');
      }

      const { AccessToken, RefreshToken, IdToken, ExpiresIn } =
        response.AuthenticationResult;

      if (!AccessToken || !RefreshToken || !IdToken) {
        throw new AuthenticationError('Tokens inválidos recebidos');
      }

      // Obter informações do usuário
      const idTokenPayload = this.jwtService.decode(IdToken);
      const user = await this.getUserInfo(AccessToken, idTokenPayload);

      // Somente BENEFICIARY pode ter refresh token
      const isBeneficiary = user.role === 'BENEFICIARY';
      const finalRefreshToken = isBeneficiary ? RefreshToken : '';

      console.log(
        '[signIn] Role:',
        user.role,
        '| Refresh token:',
        isBeneficiary ? 'permitido' : 'bloqueado',
      );

      const tokens = AuthTokens.create(
        AccessToken,
        finalRefreshToken,
        IdToken,
        ExpiresIn || 3600,
      );

      return { tokens, user };
    } catch (error: any) {
      if (error.name === 'NotAuthorizedException') {
        throw new InvalidCredentialsError('Email ou senha incorretos');
      }
      if (error.name === 'UserNotConfirmedException') {
        throw new UserNotConfirmedError(
          'Por favor, confirme seu email antes de fazer login',
        );
      }
      if (
        error instanceof InvalidCredentialsError ||
        error instanceof UserNotConfirmedError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }
      throw new AuthenticationError(`Erro ao autenticar: ${error.message}`);
    }
  }

  async completeNewPasswordChallenge(
    email: string,
    newPassword: string,
    session: string,
  ): Promise<{ tokens: AuthTokens; user: User }> {
    try {
      console.log(
        '[completeNewPasswordChallenge] Completando challenge NEW_PASSWORD_REQUIRED',
      );

      const challengeResponses: any = {
        USERNAME: email,
        NEW_PASSWORD: newPassword,
      };

      const command = new RespondToAuthChallengeCommand({
        ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
        ClientId: this.clientId,
        Session: session,
        ChallengeResponses: challengeResponses,
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new AuthenticationError('Falha ao completar mudança de senha');
      }

      const { AccessToken, RefreshToken, IdToken, ExpiresIn } =
        response.AuthenticationResult;

      if (!AccessToken || !RefreshToken || !IdToken) {
        throw new AuthenticationError('Tokens inválidos recebidos');
      }

      // Obter informações do usuário
      const idTokenPayload = this.jwtService.decode(IdToken);
      const user = await this.getUserInfo(AccessToken, idTokenPayload);

      // Somente BENEFICIARY pode ter refresh token
      const isBeneficiary = user.role === 'BENEFICIARY';
      const finalRefreshToken = isBeneficiary ? RefreshToken : '';

      console.log(
        '[completeNewPasswordChallenge] Role:',
        user.role,
        '| Refresh token:',
        isBeneficiary ? 'permitido' : 'bloqueado',
      );

      const tokens = AuthTokens.create(
        AccessToken,
        finalRefreshToken,
        IdToken,
        ExpiresIn || 3600,
      );

      return { tokens, user };
    } catch (error: any) {
      if (error.name === 'NotAuthorizedException') {
        throw new InvalidCredentialsError(
          'Senha não atende aos requisitos ou sessão inválida',
        );
      }
      if (error.name === 'InvalidPasswordException') {
        throw new InvalidCredentialsError(
          'Nova senha não atende aos requisitos de segurança',
        );
      }
      if (
        error instanceof InvalidCredentialsError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }
      throw new AuthenticationError(
        `Erro ao completar mudança de senha: ${error.message}`,
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Refresh token vazio significa que o usuário não tem permissão
      if (!refreshToken || refreshToken === '') {
        throw new InvalidCredentialsError(
          'Refresh token não permitido para esta role',
        );
      }

      const authParams: any = {
        REFRESH_TOKEN: refreshToken,
      };

      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: this.clientId,
        AuthParameters: authParams,
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new AuthenticationError('Falha ao renovar token');
      }

      const { AccessToken, RefreshToken, IdToken, ExpiresIn } =
        response.AuthenticationResult;

      if (!AccessToken || !IdToken) {
        throw new AuthenticationError('Tokens inválidos recebidos');
      }

      // Com refresh token rotation nativo do Cognito habilitado,
      // o Cognito gerencia automaticamente a rotação e invalidação
      const newRefreshToken = RefreshToken || refreshToken;

      console.log('[refreshToken] Cognito nativo - Refresh Token Rotation:', {
        tokenRotated: RefreshToken !== refreshToken,
        newTokenLength: newRefreshToken.length,
      });

      return AuthTokens.create(
        AccessToken,
        newRefreshToken,
        IdToken,
        ExpiresIn || 3600,
      );
    } catch (error: any) {
      if (error.name === 'NotAuthorizedException') {
        throw new InvalidCredentialsError('Refresh token inválido ou expirado');
      }
      if (
        error instanceof AuthenticationError ||
        error instanceof InvalidCredentialsError
      ) {
        throw error;
      }
      throw new AuthenticationError(`Erro ao renovar token: ${error.message}`);
    }
  }

  async signOut(accessToken: string): Promise<void> {
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      throw new AuthenticationError(`Erro ao fazer logout: ${error.message}`);
    }
  }

  async getUserInfo(accessToken: string, idTokenPayload?: any): Promise<User> {
    try {
      // Debug: Log do token (primeiros e últimos caracteres)
      console.log('[getUserInfo] Token recebido:', {
        length: accessToken?.length || 0,
        starts: accessToken?.substring(0, 20) || 'undefined',
        ends: accessToken?.substring(accessToken.length - 20) || 'undefined',
        hasIdTokenPayload: !!idTokenPayload,
      });

      if (!accessToken) {
        throw new InvalidCredentialsError('Token não fornecido');
      }

      // Decodificar o access token para extrair informações (incluindo grupos)
      const accessTokenPayload = this.jwtService.decode(accessToken);
      console.log('[getUserInfo] Access token decodificado:', {
        hasGroups: !!accessTokenPayload?.['cognito:groups'],
        groups: accessTokenPayload?.['cognito:groups'] || [],
        username: accessTokenPayload?.username,
        sub: accessTokenPayload?.sub,
      });

      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      console.log('[getUserInfo] Chamando Cognito GetUser...');
      const response = await this.cognitoClient.send(command);
      console.log('[getUserInfo] Resposta recebida com sucesso');

      // Priorizar idTokenPayload (se fornecido), senão usar accessTokenPayload
      // Ambos podem conter cognito:groups
      const tokenPayload = idTokenPayload || accessTokenPayload;

      const username = Array.isArray(response.UserAttributes)
        ? response.UserAttributes.find((attr: any) => attr.Name === 'name')
        : response.Username;

      // Passar tokenPayload para o mapper (contém grupos do Cognito)
      return this.userMapper.toDomain(
        {
          Username: username,
          Attributes: response.UserAttributes,
        },
        tokenPayload,
      );
    } catch (error: any) {
      console.error('[getUserInfo] Erro:', {
        name: error.name,
        message: error.message,
        code: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
      });

      if (error.name === 'NotAuthorizedException') {
        throw new InvalidCredentialsError(
          'Token de acesso inválido ou expirado',
        );
      }
      throw new AuthenticationError(
        `Erro ao obter informações do usuário: ${error.message}`,
      );
    }
  }

  async verifyToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  async initiateForgotPassword(email: string): Promise<void> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
        ...(this.clientSecret && {
          SecretHash: this.generateSecretHash(email),
        }),
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new Error('Usuário não encontrado');
      }
      throw new Error(`Erro ao iniciar redefinição de senha: ${error.message}`);
    }
  }

  async confirmForgotPassword(
    email: string,
    verificationCode: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: verificationCode,
        Password: newPassword,
        ...(this.clientSecret && {
          SecretHash: this.generateSecretHash(email),
        }),
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      if (error.name === 'CodeMismatchException') {
        throw new Error('Código de verificação inválido');
      }
      if (error.name === 'ExpiredCodeException') {
        throw new Error('Código de verificação expirado');
      }
      if (error.name === 'UserNotFoundException') {
        throw new Error('Usuário não encontrado');
      }
      throw new Error(
        `Erro ao confirmar redefinição de senha: ${error.message}`,
      );
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
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        return false;
      }
      throw new Error(
        `Erro ao verificar existência do usuário: ${error.message}`,
      );
    }
  }

  async changeUserPassword(email: string, newPassword: string): Promise<void> {
    try {
      const command = new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        Password: newPassword,
        Permanent: true, // Define a senha como permanente
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new Error('Usuário não encontrado');
      }
      if (error.name === 'InvalidPasswordException') {
        throw new Error('Nova senha não atende aos requisitos de segurança');
      }
      throw new Error(`Erro ao alterar senha: ${error.message}`);
    }
  }
}
