import { Injectable, Logger, Inject } from '@nestjs/common';
import { ChatMessage } from '../../domain/chat-message.entity';
import { ChatResponse } from '../../domain/chat-response.entity';
import { ITenantRepository } from '../../domain/interfaces/tenant-repository.interface';
import { IBedrockRepository } from '../../domain/interfaces/bedrock-repository.interface';
import { IMedicalImageRepository } from '../../domain/interfaces/medical-image-repository.interface';
import { TENANT_REPOSITORY_TOKEN, BEDROCK_REPOSITORY_TOKEN, MEDICAL_IMAGE_REPOSITORY_TOKEN } from '../../tokens';

@Injectable()
export class ProcessImageMessageUseCase {
  private readonly logger = new Logger(ProcessImageMessageUseCase.name);

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN) private readonly tenantRepository: ITenantRepository,
    @Inject(BEDROCK_REPOSITORY_TOKEN) private readonly bedrockRepository: IBedrockRepository,
    @Inject(MEDICAL_IMAGE_REPOSITORY_TOKEN) private readonly medicalImageRepository: IMedicalImageRepository,
  ) {}

  async execute(message: ChatMessage, imageBuffer: Buffer): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing image message for tenant ${message.tenantId}, session ${message.sessionId}`);

      if (!message.hasImage()) {
        throw new Error('Message does not contain valid image data');
      }

      if (!message.isMedicalImage()) {
        throw new Error('Medical consent is required for image processing');
      }

      // Validate image format and size
      if (!this.medicalImageRepository.isValidMedicalImageFormat(message.imageMimeType!)) {
        throw new Error('Unsupported image format. Use JPEG or PNG.');
      }

      if (!this.medicalImageRepository.isValidImageSize(imageBuffer)) {
        throw new Error('Invalid image size. Must be between 1KB and 10MB.');
      }

      // Validate tenant
      const tenantConfig = await this.tenantRepository.getTenantConfig(message.tenantId);
      
      // Generate tenant-specific session ID
      const tenantSessionId = this.tenantRepository.generateTenantSessionId(
        message.tenantId,
        message.sessionId,
      );

      this.logger.debug('🏥 Medical image detected, processing...');

      // Analyze medical image
      const imageAnalysis = await this.medicalImageRepository.analyzeImage(
        imageBuffer,
        message.imageMimeType!,
        tenantConfig,
      );

      // Create enhanced prompt with image information
      const enhancedMessage = this.createMedicalImagePrompt(
        message.getProcessedContent(),
        imageAnalysis,
      );

      // Process with Bedrock
      const bedrockResponse = await this.bedrockRepository.invokeForTenant(
        tenantConfig.tenantId,
        tenantConfig.awsAgentId,
        tenantConfig.awsAgentAliasId,
        message.model,
        enhancedMessage,
        message.sessionId,
      );

      const processingTime = Date.now() - startTime;

      return ChatResponse.create(
        bedrockResponse.answer,
        message.model,
        message.sessionId,
        message.tenantId,
        processingTime,
      ).withImageAnalysis(imageAnalysis).withMetadata({
        hasImage: true,
        imageMimeType: message.imageMimeType,
        medicalConsent: message.medicalConsent,
      });
    } catch (error) {
      this.logger.error(`Failed to process image message: ${error.message}`, error.stack);
      throw error;
    }
  }

  private createMedicalImagePrompt(originalMessage: string, imageAnalysis: any): string {
    const context = `
CONTEXTO DA IMAGEM MÉDICA ANALISADA:
- Labels detectados: ${imageAnalysis.labels.map((l: any) => `${l.name} (${l.confidence.toFixed(1)}%)`).join(', ')}
- Palavras-chave médicas: ${imageAnalysis.medicalKeywords.join(', ') || 'Nenhuma identificada'}
- Nível de urgência: ${imageAnalysis.urgencyLevel}
- Texto detectado na imagem: ${imageAnalysis.textContent || 'Nenhum'}

ANÁLISE PRÉVIA: ${imageAnalysis.medicalAssessment}

PERGUNTA DO PACIENTE: ${originalMessage || 'Por favor, analise esta imagem e forneça orientações.'}

INSTRUÇÕES PARA RESPOSTA:
1. Base sua resposta nas informações da imagem analisada
2. Sempre inclua disclaimers médicos apropriados
3. Sugira quando procurar atendimento médico
4. Não forneça diagnósticos definitivos
5. Foque em orientações de primeiros socorros quando apropriado
6. Considere o nível de urgência identificado
    `.trim();

    return context;
  }
}