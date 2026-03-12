import { Injectable, Logger, Inject } from '@nestjs/common';
import { ChatMessage } from '../../domain/chat-message.entity';
import { ChatResponse } from '../../domain/chat-response.entity';
import { ITenantRepository } from '../../domain/interfaces/tenant-repository.interface';
import { IBedrockRepository } from '../../domain/interfaces/bedrock-repository.interface';
import { TENANT_REPOSITORY_TOKEN, BEDROCK_REPOSITORY_TOKEN } from '../../tokens';

@Injectable()
export class ProcessTextMessageUseCase {
  private readonly logger = new Logger(ProcessTextMessageUseCase.name);

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN) private readonly tenantRepository: ITenantRepository,
    @Inject(BEDROCK_REPOSITORY_TOKEN) private readonly bedrockRepository: IBedrockRepository,
  ) {}

  async execute(message: ChatMessage): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing text message for tenant ${message.tenantId}, session ${message.sessionId}`);

      // Validate tenant
      const tenantConfig = await this.tenantRepository.getTenantConfig(message.tenantId);
      
      // Generate tenant-specific session ID
      const tenantSessionId = this.tenantRepository.generateTenantSessionId(
        message.tenantId,
        message.sessionId,
      );

      // Process with Bedrock
      const bedrockResponse = await this.bedrockRepository.invokeForTenant(
        tenantConfig.tenantId,
        tenantConfig.awsAgentId,
        tenantConfig.awsAgentAliasId,
        message.model,
        message.getProcessedContent(),
        //tenantSessionId,
        message.sessionId
      );

      const processingTime = Date.now() - startTime;

      return ChatResponse.create(
        bedrockResponse.answer,
        message.model,
        message.sessionId,
        message.tenantId,
        processingTime,
      );
    } catch (error) {
      this.logger.error(`Failed to process text message: ${error.message}`, error.stack);
      throw error;
    }
  }
}