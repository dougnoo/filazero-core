import { Injectable, Logger, Inject } from '@nestjs/common';
import { BedrockRequest } from '../../domain/bedrock-request.entity';
import { BedrockResponse } from '../../domain/bedrock-response.entity';
import { InvokeBedrockUseCase } from '../use-cases/invoke-bedrock.use-case';
import { ProcessAudioWithTranscriptionUseCase } from '../use-cases/process-audio-transcription.use-case';
import { IRateLimitService } from '../../domain/interfaces/rate-limit-service.interface';
import { RATE_LIMIT_SERVICE_TOKEN } from '../../tokens';

@Injectable()
export class BedrockService {
  private readonly logger = new Logger(BedrockService.name);

  constructor(
    private readonly invokeBedrockUseCase: InvokeBedrockUseCase,
    private readonly processAudioUseCase: ProcessAudioWithTranscriptionUseCase,
    @Inject(RATE_LIMIT_SERVICE_TOKEN) private readonly rateLimitService: IRateLimitService,
  ) {}

  async invoke(
    modelId: string,
    prompt: string,
    sessionId: string,
    audioBuffer?: Buffer,
    audioMimeType?: string,
  ): Promise<BedrockResponse> {
    const request = new BedrockRequest(modelId, prompt, sessionId, audioBuffer, audioMimeType);

    if (request.hasAudio()) {
      this.logger.debug('🎤 Audio detected, processing with transcription...');
      return this.processAudioUseCase.execute(request);
    } else {
      this.logger.debug('📝 Processing text message with Bedrock Agent...');
      return this.invokeBedrockUseCase.execute(request);
    }
  }

  async invokeForTenant(
    tenantId: string,
    agentId: string,
    agentAliasId: string,
    modelId: string,
    prompt: string,
    sessionId: string,
    audioBuffer?: Buffer,
    audioMimeType?: string,
  ): Promise<BedrockResponse> {
    const request = new BedrockRequest(modelId, prompt, sessionId, audioBuffer, audioMimeType);

    if (request.hasAudio()) {
      this.logger.debug(`🎤 Audio detected for tenant ${tenantId}, processing with transcription...`);
      return this.processAudioUseCase.executeForTenant(request, tenantId, agentId, agentAliasId);
    } else {
      this.logger.debug(`📝 Processing text message for tenant ${tenantId} with Bedrock Agent...`);
      return this.invokeBedrockUseCase.executeForTenant(request, tenantId, agentId, agentAliasId);
    }
  }

  async getRateLimitStatus(sessionId?: string) {
    return this.rateLimitService.getRateLimitStatus(sessionId);
  }
}