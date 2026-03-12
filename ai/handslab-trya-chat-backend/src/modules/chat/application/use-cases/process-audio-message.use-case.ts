import { Injectable, Logger, Inject } from '@nestjs/common';
import { ChatMessage } from '../../domain/chat-message.entity';
import { ChatResponse } from '../../domain/chat-response.entity';
import { ITenantRepository } from '../../domain/interfaces/tenant-repository.interface';
import { IBedrockRepository } from '../../domain/interfaces/bedrock-repository.interface';
import { TENANT_REPOSITORY_TOKEN, BEDROCK_REPOSITORY_TOKEN } from '../../tokens';

@Injectable()
export class ProcessAudioMessageUseCase {
  private readonly logger = new Logger(ProcessAudioMessageUseCase.name);

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN) private readonly tenantRepository: ITenantRepository,
    @Inject(BEDROCK_REPOSITORY_TOKEN) private readonly bedrockRepository: IBedrockRepository,
  ) {}

  async execute(message: ChatMessage, audioBuffer: Buffer): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing audio message for tenant ${message.tenantId}, session ${message.sessionId}`);

      if (!message.hasAudio()) {
        throw new Error('Message does not contain valid audio data');
      }

      // Validate tenant
      const tenantConfig = await this.tenantRepository.getTenantConfig(message.tenantId);
      
      // Generate tenant-specific session ID
      const tenantSessionId = this.tenantRepository.generateTenantSessionId(
        message.tenantId,
        message.sessionId,
      );

      // Process with Bedrock (audio + text)
      const bedrockResponse = await this.bedrockRepository.invokeForTenant(
        tenantConfig.tenantId,
        tenantConfig.awsAgentId,
        tenantConfig.awsAgentAliasId,
        message.model,
        message.getProcessedContent(),
        //tenantSessionId,
        message.sessionId,
        audioBuffer,
        message.audioMimeType,
      );

      const processingTime = Date.now() - startTime;

      return ChatResponse.create(
        bedrockResponse.answer,
        message.model,
        message.sessionId,
        message.tenantId,
        processingTime,
      ).withMetadata({
        hasAudio: true,
        audioMimeType: message.audioMimeType,
      });
    } catch (error) {
      this.logger.error(`Failed to process audio message: ${error.message}`, error.stack);
      throw error;
    }
  }
}