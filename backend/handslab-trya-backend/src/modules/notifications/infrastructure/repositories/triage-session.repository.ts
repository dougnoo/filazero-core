import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { DYNAMODB_CLIENT_TOKEN } from '../../../../shared/infrastructure/providers/dynamodb.provider';
import {
  ITriageSessionRepository,
  AttachmentData,
} from '../../domain/interfaces/triage-session.repository.interface';
import { ResponseStyle } from 'src/modules/chat/domain/enums/response-style.enum';

@Injectable()
export class TriageSessionRepository implements ITriageSessionRepository {
  private readonly sessionsTable: string;

  constructor(
    @Inject(DYNAMODB_CLIENT_TOKEN)
    private readonly dynamoClient: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
  ) {
    this.sessionsTable =
      this.configService.get<string>('aws.dynamodb.sessionsTable') ||
      'triagem-sessions';
  }

  async findUserIdBySession(sessionId: string): Promise<{
    userId: string;
    specialty?: string;
  } | null> {
    const command = new GetCommand({
      TableName: this.sessionsTable,
      Key: { session_id: sessionId },
    });

    const result = await this.dynamoClient.send(command);
    if (!result.Item?.user_id) {
      return null;
    }

    const specialty = result.Item?.patient_data?.medical_summary?.specialty;

    return {
      userId: result.Item.user_id,
      specialty,
    };
  }

  async completeSession(
    sessionId: string,
    attachments: AttachmentData[],
    doctorName: string,
  ): Promise<void> {
    const examsList = attachments.map((att) => `**${att.name}**`).join(', ');
    const timestamp = new Date().toISOString();

    const messages = [
      {
        type: 'DoctorMessage',
        content: `Para uma avaliação mais precisa, solicito a realização do(s) exame(s): ${examsList}.\nLeve este pedido ao médico ou serviço de saúde de sua preferência para dar continuidade ao atendimento.`,
        timestamp,
        style: ResponseStyle.EXAM,
      },
      {
        type: 'AiMessage',
        content: `Sempre que surgir um novo sintoma, se precisar de orientações rápidas ou quiser atualizar seus dados de saúde (como o monitoramento da sua pressão ou glicemia), basta iniciar um novo chat. Estamos disponíveis 24 horas por dia para garantir que você receba o suporte necessário de forma ágil e segura.
        Lembre-se: a Trya estará sempre aqui quando você precisar.`,
        timestamp,
      },
    ];

    const command = new UpdateCommand({
      TableName: this.sessionsTable,
      Key: { session_id: sessionId },
      UpdateExpression:
        'SET doctor_attachments = :attachments, #status = :status, finish_at = :finishAt, messages = list_append(messages, :finalMessages), doctor_name = :doctorName',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':attachments': attachments.map((att) => ({
          name: att.name,
          filename: att.filename,
          link: att.link,
          size: att.size,
          extension: att.extension,
        })),
        ':status': 'COMPLETED',
        ':finishAt': new Date().toISOString(),
        ':finalMessages': messages,
        ':doctorName': doctorName,
      },
    });

    await this.dynamoClient.send(command);
  }
}
