import { Injectable, Logger, Inject } from '@nestjs/common';
import { IAudioTranscriptionService } from '../../domain/interfaces/audio-transcription-service.interface';
import { BedrockRequest } from '../../domain/bedrock-request.entity';
import { BedrockResponse } from '../../domain/bedrock-response.entity';
import { InvokeBedrockUseCase } from './invoke-bedrock.use-case';
import { AUDIO_TRANSCRIPTION_SERVICE_TOKEN } from '../../tokens';

@Injectable()
export class ProcessAudioWithTranscriptionUseCase {
  private readonly logger = new Logger(ProcessAudioWithTranscriptionUseCase.name);

  constructor(
    @Inject(AUDIO_TRANSCRIPTION_SERVICE_TOKEN) private readonly transcriptionService: IAudioTranscriptionService,
    private readonly invokeBedrockUseCase: InvokeBedrockUseCase,
  ) {}

  async execute(request: BedrockRequest): Promise<BedrockResponse> {
    if (!request.hasAudio()) {
      throw new Error('Audio buffer and mime type are required for audio processing');
    }

    try {
      this.logger.debug(`Processing audio for session: ${request.sessionId}`);

      // Transcrever o áudio
      const transcription = await this.transcriptionService.transcribeAudio(
        request.audioBuffer!,
        request.audioMimeType!,
      );

      this.logger.debug(`Audio transcribed successfully: ${transcription.substring(0, 100)}...`);

      // Criar nova requisição com a transcrição
      const transcribedRequest = new BedrockRequest(
        request.modelId,
        `${request.prompt}\n\nTranscrição do áudio: ${transcription}`,
        request.sessionId,
      );

      // Processar com Bedrock
      const response = await this.invokeBedrockUseCase.execute(transcribedRequest);

      // Adicionar metadata sobre a transcrição
      return response.withMetadata({
        transcription: transcription,
        hasAudio: true,
        audioMimeType: request.audioMimeType,
      });
    } catch (error) {
      this.logger.error(`Failed to process audio: ${error.message}`, error.stack);
      throw error;
    }
  }

  async executeForTenant(
    request: BedrockRequest,
    tenantId: string,
    agentId?: string,
    agentAliasId?: string,
  ): Promise<BedrockResponse> {
    if (!request.hasAudio()) {
      throw new Error('Audio buffer and mime type are required for audio processing');
    }

    try {
      this.logger.debug(`Processing audio for tenant ${tenantId}, session: ${request.sessionId}`);

      // Transcrever o áudio
      const transcription = await this.transcriptionService.transcribeAudio(
        request.audioBuffer!,
        request.audioMimeType!,
      );

      this.logger.debug(`Audio transcribed successfully for tenant ${tenantId}: ${transcription.substring(0, 100)}...`);

      // Criar nova requisição com a transcrição
      const transcribedRequest = new BedrockRequest(
        request.modelId,
        `${request.prompt}\n\nTranscrição do áudio: ${transcription}`,
        request.sessionId,
      );

      // Processar com Bedrock para o tenant
      const response = await this.invokeBedrockUseCase.executeForTenant(
        transcribedRequest,
        tenantId,
        agentId,
        agentAliasId,
      );

      // Adicionar metadata sobre a transcrição
      return response.withMetadata({
        transcription: transcription,
        hasAudio: true,
        audioMimeType: request.audioMimeType,
        tenantId: tenantId,
      });
    } catch (error) {
      this.logger.error(`Failed to process audio for tenant ${tenantId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}