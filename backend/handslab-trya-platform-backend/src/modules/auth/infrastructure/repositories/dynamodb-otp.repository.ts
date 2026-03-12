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

@Injectable()
export class DynamoDbOtpRepository implements IOtpRepository {
  private readonly logger = new Logger(DynamoDbOtpRepository.name);
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const profile = this.configService.get<string>('AWS_PROFILE');
    this.tableName = this.configService.get<string>(
      'DYNAMODB_OTP_TABLE_NAME',
      'platform-otp-codes',
    );

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    const dynamoClient = new DynamoDBClient({
      region,
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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.debug(`OTP gerado: ${otp}`);
    return otp;
  }

  async storeOtp(
    email: string,
    otp: string,
    expiresInSeconds: number = 300,
    type: OtpType = OtpType.FIRST_LOGIN,
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const createdAt = new Date().toISOString();

    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            email: normalizedEmail,
            otp,
            type,
            expiresAt,
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

      const now = Math.floor(Date.now() / 1000);
      if (now > result.Item.expiresAt) {
        this.logger.warn(`OTP expirado no DynamoDB para ${normalizedEmail}`);
        await this.removeOtp(email);
        return false;
      }

      const isValidOtp = result.Item.otp === otp;
      if (!isValidOtp) {
        this.logger.warn(`OTP inválido no DynamoDB para ${normalizedEmail}`);
        return false;
      }

      if (expectedType && result.Item.type !== expectedType) {
        this.logger.warn(
          `Tipo de OTP incorreto para ${normalizedEmail}. Esperado: ${expectedType}, Encontrado: ${result.Item.type}`,
        );
        return false;
      }

      this.logger.log(
        `OTP ${result.Item.type} válido no DynamoDB para ${normalizedEmail}`,
      );
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

      const now = Math.floor(Date.now() / 1000);
      if (now > result.Item.expiresAt) {
        this.logger.debug(`OTP expirado no DynamoDB para ${normalizedEmail}`);
        return null;
      }

      const isValidOtp = result.Item.otp === otp;
      if (!isValidOtp) {
        this.logger.debug(`OTP inválido no DynamoDB para ${normalizedEmail}`);
        return null;
      }

      if (expectedType && result.Item.type !== expectedType) {
        this.logger.debug(
          `Tipo de OTP incorreto para ${normalizedEmail}. Esperado: ${expectedType}, Encontrado: ${result.Item.type}`,
        );
        return null;
      }

      this.logger.debug(
        `OTP ${result.Item.type} válido no DynamoDB para ${normalizedEmail} (verificação sem consumo)`,
      );

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
    }
  }

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
