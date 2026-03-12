import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  ICognitoSyncService,
  CognitoSyncData,
} from '../../domain/services/cognito-sync.service.interface';

/**
 * Serviço de sincronização com Cognito (Infrastructure Layer)
 *
 * Responsável por atualizar atributos de usuários no AWS Cognito
 */
@Injectable()
export class CognitoSyncService implements ICognitoSyncService {
  private readonly logger = new Logger(CognitoSyncService.name);
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId: string;

  constructor(private readonly configService: ConfigService) {
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    this.cognitoClient = new CognitoIdentityProviderClient({
      region:
        this.configService.get<string>('aws.cognito.region') || 'us-east-1',
      ...(profile ? { profile } : {}),
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });
    this.userPoolId =
      this.configService.get<string>('aws.cognito.userPoolId') || '';
  }

  async syncBeneficiaryAttributes(
    userEmail: string,
    data: CognitoSyncData,
  ): Promise<void> {
    try {
      if (!userEmail) {
        this.logger.warn(
          'Beneficiário não tem email, pulando sincronização com Cognito',
        );
        return;
      }

      // No Cognito, o email é usado como username
      const username = userEmail;

      // Preparar atributos para atualização
      const attributes: Array<{ Name: string; Value: string }> = [];

      if (data.name !== undefined) {
        attributes.push({ Name: 'name', Value: data.name });
      }

      if (data.email !== undefined) {
        attributes.push({ Name: 'email', Value: data.email });
        attributes.push({ Name: 'email_verified', Value: 'true' });
      }

      if (data.phone !== undefined) {
        // Cognito espera formato E.164: +5511987654321
        const formattedPhone = data.phone.startsWith('+')
          ? data.phone
          : `+55${data.phone}`;
        attributes.push({ Name: 'phone_number', Value: formattedPhone });
        attributes.push({ Name: 'phone_number_verified', Value: 'true' });
      }

      if (data.tenantId !== undefined) {
        attributes.push({ Name: 'custom:tenant_id', Value: data.tenantId });
      }

      if (attributes.length === 0) {
        this.logger.log('Nenhum atributo para sincronizar com Cognito');
        return;
      }

      // Atualizar atributos no Cognito
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        UserAttributes: attributes,
      });

      await this.cognitoClient.send(command);

      this.logger.log(
        `Atributos sincronizados com Cognito para usuário ${username}: ${attributes.map((a) => a.Name).join(', ')}`,
      );
    } catch (error: any) {
      // Tratamento específico de erros
      if (error.name === 'UserNotFoundException') {
        this.logger.warn(
          `Usuário ${userEmail} não encontrado no Cognito (pode estar inativo)`,
        );
      } else {
        this.logger.error(
          `Erro ao sincronizar com Cognito: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        );
      }
      // Não lançar erro - continua mesmo se falhar a sincronização
      // Isso evita que a atualização no PostgreSQL seja revertida
    }
  }
}
