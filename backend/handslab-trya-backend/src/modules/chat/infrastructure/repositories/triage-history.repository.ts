import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import type { RedisClientType } from 'redis';
import type {
  ITriageHistoryRepository,
  PaginatedResult,
} from '../../domain/repositories/triage-history.repository.interface';
import {
  TriageSession,
  TriageMessage,
} from '../../domain/entities/triage-session.entity';
import { SessionStatus } from '../../domain/value-objects/session-status.enum';
import { DYNAMODB_CLIENT_TOKEN } from '../../../../shared/infrastructure/providers/dynamodb.provider';
import { REDIS_CLIENT_TOKEN } from '../../../../shared/infrastructure/providers/redis.provider';

@Injectable()
export class TriageHistoryRepository
  implements ITriageHistoryRepository, OnModuleDestroy
{
  private readonly logger = new Logger(TriageHistoryRepository.name);
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_CLIENT_TOKEN)
    private readonly dynamoClient: DynamoDBDocumentClient,
    @Inject(REDIS_CLIENT_TOKEN)
    private readonly redisClient: RedisClientType | null,
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('aws.dynamodb.sessionsTable') ||
      'triagem-sessions';
  }

  async getHistory(
    userId: string,
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<TriageSession>> {
    console.log(
      `📚 [getHistory] Buscando histórico para user ${userId} (page: ${page})`,
    );

    const sessions: TriageSession[] = [];
    const seenSessionIds = new Set<string>();

    // 1. Buscar sessões finalizadas do DynamoDB (prioridade)
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'user_id-updated_at-index',
        KeyConditionExpression: 'user_id = :userId',
        FilterExpression: 'tenant_id = :tenantId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':tenantId': tenantId,
        },
        ScanIndexForward: false,
      });

      const result = await this.dynamoClient.send(command);

      if (result.Items) {
        for (const item of result.Items) {
          sessions.push(this.mapToEntity(item));
          seenSessionIds.add(item.session_id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar sessões do DynamoDB:', error);
    }

    // 2. Buscar sessões ativas do Redis (apenas se não existir no DynamoDB)
    if (this.redisClient) {
      try {
        const sessionKeys: string[] = [];
        let cursor = 0;

        do {
          const result = await this.redisClient.scan(cursor, {
            MATCH: 'session:*',
            COUNT: 100,
          });

          cursor = result.cursor;
          sessionKeys.push(...result.keys);
        } while (cursor !== 0);

        let redisMatches = 0;
        for (const key of sessionKeys) {
          const data = await this.redisClient.get(key);
          if (data) {
            const session = JSON.parse(data);
            if (
              session.user_id === userId &&
              session.tenant_id === tenantId &&
              !seenSessionIds.has(session.session_id)
            ) {
              sessions.push(this.mapToEntity(session));
              seenSessionIds.add(session.session_id);
              redisMatches++;
            }
          }
        }

        if (redisMatches > 0) {
          console.log(`   ✅ ${redisMatches} sessões encontradas no Redis`);
        }
      } catch (error) {
        console.error('❌ [getHistory] Erro ao buscar no Redis:', error);
      }
    }

    // 3. Ordenar por updated_at DESC
    sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // 4. Aplicar paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = sessions.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total: sessions.length,
      page,
      limit,
    };
  }

  async getSession(
    sessionId: string,
    userId: string,
    tenantId: string,
  ): Promise<TriageSession | null> {
    // 1. Buscar do DynamoDB primeiro (mais provável - sessões finalizadas)
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { session_id: sessionId },
      });

      const result = await this.dynamoClient.send(command);

      if (
        result.Item &&
        result.Item.user_id === userId &&
        result.Item.tenant_id === tenantId
      ) {
        return this.mapToEntity(result.Item);
      }
    } catch (error) {
      console.error('Erro ao buscar sessão do DynamoDB:', error);
    }

    // 2. Se não encontrou no DynamoDB, buscar no Redis (menos provável - sessão em andamento)
    if (this.redisClient) {
      try {
        const data = await this.redisClient.get(`session:${sessionId}`);
        if (data) {
          const session = JSON.parse(data);
          if (session.user_id === userId && session.tenant_id === tenantId) {
            return this.mapToEntity(session);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar sessão do Redis:', error);
      }
    }

    return null;
  }

  async getActiveSession(
    userId: string,
    tenantId: string,
  ): Promise<TriageSession | null> {
    this.logger.log(`[getActiveSession] Buscando sessão ativa para userId=${userId}, tenantId=${tenantId}`);

    if (!this.redisClient) {
      this.logger.warn('[getActiveSession] Redis não disponível');
      return null;
    }

    try {
      let cursor = 0;

      do {
        const result = await this.redisClient.scan(cursor, {
          MATCH: 'session:*',
          COUNT: 100,
        });

        cursor = result.cursor;

        for (const key of result.keys) {
          const data = await this.redisClient.get(key);
          if (data) {
            const session = JSON.parse(data);
            if (
              session.user_id === userId &&
              session.tenant_id === tenantId &&
              session.status === 'DRAFT' &&
              !session.is_complete
            ) {
              this.logger.log(`[getActiveSession] Sessão ativa encontrada: sessionId=${session.session_id}`);
              return this.mapToEntity(session);
            }
          }
        }
      } while (cursor !== 0);

      this.logger.log('[getActiveSession] Nenhuma sessão ativa encontrada');
    } catch (error) {
      this.logger.error(`[getActiveSession] Erro: ${error instanceof Error ? error.message : error}`);
    }

    return null;
  }

  private mapToEntity(data: any): TriageSession {
    const messages: TriageMessage[] =
      data.messages?.map((msg: any) => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
        phase: msg.phase,
        style: msg.style,
        options: msg.options,
        hasSummaryPresentation: msg.has_summary_presentation,
        summaryPresentation: msg.summary_presentation,
      })) || [];

    const status = this.mapStatus(data.status, data.is_complete);

    return new TriageSession(
      data.session_id,
      data.user_id,
      messages,
      status,
      data.is_complete || false,
      new Date(data.updated_at),
      data.patient_name,
      data.patient_data?.medical_summary?.summary,
      status === SessionStatus.COMPLETED ? data.doctor_attachments : undefined,
      data.doctor_name,
      data.patient_data?.symptoms || [],
      data.patient_data?.medical_summary?.chief_complaint || null,
      data.current_stage,
      data.patient_data?.medical_summary?.specialty || null,
    );
  }

  private mapStatus(status: string, isComplete: boolean): SessionStatus {
    if (!isComplete && status === 'DRAFT') return SessionStatus.DRAFT;
    if (isComplete && status === 'PENDING') return SessionStatus.PENDING;
    if (status === 'COMPLETED') return SessionStatus.COMPLETED;
    return SessionStatus.DRAFT;
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}
