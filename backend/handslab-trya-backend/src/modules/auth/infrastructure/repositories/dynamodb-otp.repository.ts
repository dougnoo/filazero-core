import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { IOtpRepository } from '../../domain/repositories/otp.repository.interface';
import { OtpType } from '../../domain/value-objects/otp-type.enum';

/**
 * Implementação do repositório de OTP usando AWS DynamoDB
 *
 * Características:
 * - TTL automático (DynamoDB remove itens expirados automaticamente)
 * - Serverless (sem servidor para gerenciar)
 * - Escalável automaticamente
 * - Pay-per-request
 *
 * Configuração necessária:
 * - Tabela DynamoDB com nome configurável
 * - Partition Key: "email" (String)
 * - Atributo TTL: "expiresAt" (Number)
 *
 * Variáveis de ambiente:
 * - AWS_REGION: Região da AWS (ex: us-east-1)
 * - DYNAMODB_OTP_TABLE_NAME: Nome da tabela (padrão: OtpCodes)
 * - AWS_ACCESS_KEY_ID: Credenciais AWS (opcional se usar IAM Role)
 * - AWS_SECRET_ACCESS_KEY: Credenciais AWS (opcional se usar IAM Role)
 */
@Injectable()
export class DynamoDbOtpRepository implements IOtpRepository {
  private readonly logger = new Logger(DynamoDbOtpRepository.name);
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('aws.region', 'us-east-1');
    const profile = this.configService.get<string>('aws.profile');
    this.tableName = this.configService.get<string>(
      'aws.dynamodb.otpTableName',
      'trya-otp',
    );

    // Criar cliente DynamoDB
    // O SDK detectará automaticamente as credenciais de:
    // 1. AWS SSO (após aws sso login) - use AWS_PROFILE
    // 2. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    // 3. IAM Role (se rodando em EC2/ECS/Lambda)
    // 4. AWS credentials file (~/.aws/credentials)
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );
    const endpointUrl = this.configService.get<string>('aws.endpointUrl');

    const dynamoClient = new DynamoDBClient({
      region,
      ...(endpointUrl
        ? {
            endpoint: endpointUrl,
            credentials: { accessKeyId: accessKeyId || 'test', secretAccessKey: secretAccessKey || 'test' },
          }
        : {
            ...(profile ? { profile } : {}),
            ...(accessKeyId && secretAccessKey
              ? {
                  credentials: { accessKeyId, secretAccessKey },
                }
              : {}),
          }),
    });

    // Criar document client (mais fácil de usar)
    this.client = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    });

    this.logger.log(
      `DynamoDB OTP Repository inicializado - Tabela: ${this.tableName}, Região: ${region}`,
    );
  }

  generateOtp(): string {
    // Gerar código de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.debug(`OTP gerado: ${otp}`);
    return otp;
  }

  async storeOtp(
    email: string,
    otp: string,
    expiresInSeconds: number = 300, // 5 minutos padrão
    type: OtpType = OtpType.FIRST_LOGIN, // Padrão para primeiro login
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // DynamoDB TTL usa Unix timestamp em segundos
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const createdAt = new Date().toISOString();

    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            email: normalizedEmail,
            otp,
            type, // Tipo do OTP
            expiresAt, // TTL attribute (DynamoDB removerá automaticamente)
            createdAt,
            ttlSeconds: expiresInSeconds,
          },
        }),
      );

      this.logger.log(
        `OTP ${type} armazenado no DynamoDB para ${normalizedEmail}, expira em ${expiresInSeconds}s (${new Date(expiresAt * 1000).toISOString()})`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao armazenar OTP ${type} no DynamoDB para ${normalizedEmail}:`,
        error,
      );
      throw new Error(
        `Falha ao armazenar OTP: ${error.message || 'Erro desconhecido'}`,
      );
    }
  }

  async validateOtp(
    email: string,
    otp: string,
    expectedType?: OtpType,
  ): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            email: normalizedEmail,
          },
        }),
      );

      if (!result.Item) {
        this.logger.warn(
          `OTP não encontrado no DynamoDB para ${normalizedEmail}`,
        );
        return false;
      }

      // Verificar se expirou (dupla verificação, além do TTL do DynamoDB)
      const now = Math.floor(Date.now() / 1000);
      if (now > result.Item.expiresAt) {
        this.logger.warn(`OTP expirado no DynamoDB para ${normalizedEmail}`);
        await this.removeOtp(email);
        return false;
      }

      // Verificar se o código OTP está correto
      const isValidOtp = result.Item.otp === otp;
      if (!isValidOtp) {
        this.logger.warn(`OTP inválido no DynamoDB para ${normalizedEmail}`);
        return false;
      }

      // Verificar se o tipo está correto (se especificado)
      if (expectedType && result.Item.type !== expectedType) {
        this.logger.warn(
          `Tipo de OTP incorreto para ${normalizedEmail}. Esperado: ${expectedType}, Encontrado: ${result.Item.type}`,
        );
        return false;
      }

      this.logger.log(
        `OTP ${result.Item.type} válido no DynamoDB para ${normalizedEmail}`,
      );
      // Remover OTP após validação bem-sucedida (uso único)
      await this.removeOtp(email);
      return true;
    } catch (error) {
      this.logger.error(
        `Erro ao validar OTP no DynamoDB para ${normalizedEmail}:`,
        error,
      );
      throw new Error(
        `Falha ao validar OTP: ${error.message || 'Erro desconhecido'}`,
      );
    }
  }

  async validateOtpWithoutConsuming(
    email: string,
    otp: string,
    expectedType?: OtpType,
  ): Promise<{ expiresAt: string; type: string } | null> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            email: normalizedEmail,
          },
        }),
      );

      if (!result.Item) {
        this.logger.debug(
          `OTP não encontrado no DynamoDB para ${normalizedEmail}`,
        );
        return null;
      }

      // Verificar se expirou (dupla verificação, além do TTL do DynamoDB)
      const now = Math.floor(Date.now() / 1000);
      if (now > result.Item.expiresAt) {
        this.logger.debug(`OTP expirado no DynamoDB para ${normalizedEmail}`);
        return null;
      }

      // Verificar se o código OTP está correto
      const isValidOtp = result.Item.otp === otp;
      if (!isValidOtp) {
        this.logger.debug(`OTP inválido no DynamoDB para ${normalizedEmail}`);
        return null;
      }

      // Verificar se o tipo está correto (se especificado)
      if (expectedType && result.Item.type !== expectedType) {
        this.logger.debug(
          `Tipo de OTP incorreto para ${normalizedEmail}. Esperado: ${expectedType}, Encontrado: ${result.Item.type}`,
        );
        return null;
      }

      this.logger.debug(
        `OTP ${result.Item.type} válido no DynamoDB para ${normalizedEmail} (verificação sem consumo)`,
      );

      // Retornar informações do OTP sem consumir
      return {
        expiresAt: new Date(result.Item.expiresAt * 1000).toISOString(),
        type: result.Item.type,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao verificar OTP no DynamoDB para ${normalizedEmail}:`,
        error,
      );
      return null;
    }
  }

  async removeOtp(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      await this.client.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: {
            email: normalizedEmail,
          },
        }),
      );

      this.logger.debug(`OTP removido do DynamoDB para ${normalizedEmail}`);
    } catch (error) {
      this.logger.error(
        `Erro ao remover OTP do DynamoDB para ${normalizedEmail}:`,
        error,
      );
      // Não lançar erro aqui, pois a remoção é secundária
    }
  }

  /**
   * Método auxiliar para verificar se a tabela existe
   * Útil para health checks
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            email: 'health-check-test@example.com',
          },
        }),
      );
      return true;
    } catch (error) {
      this.logger.error('Health check do DynamoDB falhou:', error);
      return false;
    }
  }
}
