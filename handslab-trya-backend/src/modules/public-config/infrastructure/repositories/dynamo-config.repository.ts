import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { IConfigRepository } from '../../domain/repositories/config.repository.interface';
import { ConfigData } from '../../domain/entities/config-data.entity';
import { ConfigFetchFailedError } from '../../domain/errors/config-fetch-failed.error';
import { ConfigSaveFailedError } from '../../domain/errors/config-save-failed.error';
import { ConfigDeleteFailedError } from '../../domain/errors/config-delete-failed.error';

@Injectable()
export class DynamoConfigRepository implements IConfigRepository {
  private readonly logger = new Logger(DynamoConfigRepository.name);
  private readonly dynamoClient: DynamoDBDocumentClient;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('aws.region')!;

    // Obter credenciais opcionais da configuração
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    const endpointUrl = this.configService.get<string>('aws.endpointUrl');

    const clientConfig: Record<string, unknown> = {
      region: this.region,
    };

    if (endpointUrl) {
      clientConfig.endpoint = endpointUrl;
      clientConfig.credentials = {
        accessKeyId: accessKeyId || 'test',
        secretAccessKey: secretAccessKey || 'test',
      };
      this.logger.debug(`Using LocalStack endpoint: ${endpointUrl}`);
    } else if (profile) {
      clientConfig.profile = profile;
      this.logger.debug(`Using AWS SSO profile: ${profile}`);
    } else if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = { accessKeyId, secretAccessKey };
      this.logger.debug('Using explicit AWS credentials');
    } else {
      this.logger.warn(
        'No explicit AWS credentials or profile provided. Using default credential chain.',
      );
    }

    const dynamoClient = new DynamoDBClient(clientConfig);
    this.dynamoClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async getConfig(
    tenantName: string,
    configKey: string,
  ): Promise<ConfigData | null> {
    try {
      const command = new GetCommand({
        TableName: tenantName,
        Key: {
          id: configKey,
        },
      });

      const result = await this.dynamoClient.send(command);

      if (!result.Item) {
        return null;
      }

      return result.Item as ConfigData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Erro ao buscar configuração '${configKey}' para tenant '${tenantName}'`,
        error,
      );
      throw new ConfigFetchFailedError(tenantName, configKey, errorMessage);
    }
  }

  async saveConfig(
    tenantName: string,
    configKey: string,
    configData: ConfigData,
  ): Promise<void> {
    try {
      const now = new Date().toISOString();

      const command = new PutCommand({
        TableName: tenantName,
        Item: {
          tenantName,
          configKey,
          data: configData,
          createdAt: now,
          updatedAt: now,
        },
      });

      await this.dynamoClient.send(command);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Erro ao salvar configuração '${configKey}' para tenant '${tenantName}'`,
        error,
      );
      throw new ConfigSaveFailedError(tenantName, configKey, errorMessage);
    }
  }

  async deleteConfig(tenantName: string, configKey: string): Promise<void> {
    try {
      const command = new DeleteCommand({
        //TableName: this.configTable,
        TableName: tenantName,
        Key: {
          tenantName,
          configKey,
        },
      });

      await this.dynamoClient.send(command);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Erro ao deletar configuração '${configKey}' para tenant '${tenantName}'`,
        error,
      );
      throw new ConfigDeleteFailedError(tenantName, configKey, errorMessage);
    }
  }
}
