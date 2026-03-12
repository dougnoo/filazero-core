import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { IChatProvider } from '../../domain/ports/chat-provider.interface';
import { ChatProviderResponse } from '../../domain/types/chat-provider-response.type';
import { SendMessagePayload } from '../../domain/entities/send-message-payload';
import { OnboardData } from '../../domain/value-objects/onboard-data.value-object';

@Injectable()
export class AwsLambdaChatProvider implements IChatProvider {
  private readonly lambdaClient: LambdaClient;
  private readonly functionName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('aws.region');
    this.functionName =
      this.configService.get<string>('aws.lambda.chatFunction') ||
      'trya-chat-function';

    // Obter credenciais opcionais da configuração
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    this.lambdaClient = new LambdaClient({
      region,
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
  }

  async sendMessage(
    message: string,
    sessionId: string,
    userId: string,
    name: string,
    tenantId: string,
    audio?: string,
    audioFormat?: string,
    images?: any[],
    onboardData?: OnboardData,
    hasOnboarded?: boolean,
  ): Promise<ChatProviderResponse> {
    const payload: SendMessagePayload = {
      message,
      session_id: sessionId,
      user_id: userId,
      name,
      tenant_id: tenantId,
      has_onboarded: hasOnboarded ?? false,
    };

    if (audio) {
      payload.audio = audio;
    }
    if (audioFormat) {
      payload.audio_format = audioFormat;
    }
    if (images && images.length > 0) {
      payload.images = images;
    }
    if (onboardData) {
      payload.onboard_data = {
        chronicConditions: onboardData.chronicConditions,
        medications: onboardData.medications,
        allergies: onboardData.allergies,
      };
    }

    const command = new InvokeCommand({
      FunctionName: this.functionName,
      Payload: Buffer.from(JSON.stringify(payload)),
    });

    try {
      const response = await this.lambdaClient.send(command);

      if (response.Payload) {
        const responsePayload = Buffer.from(response.Payload).toString('utf-8');
        console.log(
          '[ChatProvider] Lambda raw response:',
          responsePayload.substring(0, 500),
        );

        const parsedResponse = JSON.parse(responsePayload);

        // Handle API Gateway Proxy Integration response structure
        if (parsedResponse.body && typeof parsedResponse.body === 'string') {
          try {
            const body = JSON.parse(parsedResponse.body);

            // Check if Lambda returned an error
            if (parsedResponse.statusCode && parsedResponse.statusCode >= 400) {
              console.error(
                '[ChatProvider] Lambda returned error status:',
                parsedResponse.statusCode,
                body,
              );
              return {
                message:
                  body.error ||
                  body.message ||
                  'Erro ao processar sua mensagem. Tente novamente.',
                session_id: sessionId,
                is_complete: false,
              };
            }

            return {
              message: body.message,
              messages: body.messages,
              session_id: body.session_id,
              is_complete: body.is_complete,
              transcribed_text: body.transcribed_text,
              current_stage: body.current_stage,
            };
          } catch (e) {
            console.warn(
              '[ChatProvider] Failed to parse Lambda body as JSON:',
              e,
            );
            return parsedResponse;
          }
        }

        return parsedResponse;
      }

      console.warn('[ChatProvider] Lambda returned no payload');
      return {
        message: 'Não foi possível processar sua mensagem. Tente novamente.',
        session_id: sessionId,
        is_complete: false,
      };
    } catch (error) {
      console.error('[ChatProvider] Error invoking Lambda:', error);
      throw new InternalServerErrorException(
        'Erro ao processar mensagem do chat',
      );
    }
  }
}
