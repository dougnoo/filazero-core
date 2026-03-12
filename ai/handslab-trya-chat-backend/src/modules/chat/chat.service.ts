import { Injectable } from '@nestjs/common';
import { BedrockResponse } from '@modules/awsbedrock/interfaces/bedrock-response.interface';
import { NewMessageDto } from './dto/new-message.dto';
import { TenantService } from '../tenant/tenant.service';
import { MedicalImageService, ImageAnalysisResult } from '../medical-image';
import { BedrockService } from '@modules/awsbedrock';

@Injectable()
export class ChatService {

    constructor(
        
        private readonly tenantService: TenantService,
        private readonly medicalImageService: MedicalImageService,
        private readonly bedrockService: BedrockService

    ) {}

    async chat(newMessageDto: NewMessageDto, audioBuffer?: Buffer, audioMimeType?: string, imageBuffer?: Buffer, imageMimeType?: string): Promise<BedrockResponse & { imageAnalysis?: ImageAnalysisResult }> {
        // Validar tenant
        const tenantConfig = await this.tenantService.getTenantConfig(newMessageDto.tenantId);
        
        // Criar sessionId isolado por tenant
        const tenantSessionId = this.tenantService.generateTenantSessionId(
            newMessageDto.tenantId, 
            newMessageDto.sessionId
        );

        let imageAnalysis: ImageAnalysisResult | undefined;
        let enhancedMessage = newMessageDto.message;

        // Se há imagem, processar primeiro
        if (imageBuffer && imageMimeType) {
            console.log('🏥 Imagem médica detectada, processando...');
            
            // Validar formato e tamanho da imagem
            if (!this.medicalImageService.isValidMedicalImageFormat(imageMimeType)) {
                throw new Error('Formato de imagem não suportado. Use JPEG ou PNG.');
            }
            
            if (!this.medicalImageService.isValidImageSize(imageBuffer)) {
                throw new Error('Tamanho da imagem inválido. Deve ter entre 1KB e 10MB.');
            }

            // Analisar imagem médica
            imageAnalysis = await this.medicalImageService.analyzeImage(
                imageBuffer, 
                imageMimeType, 
                tenantConfig
            );

            // Criar prompt enriquecido com informações da imagem
            enhancedMessage = this.createMedicalImagePrompt(newMessageDto.message, imageAnalysis);
        }

        // Invocar Bedrock com configurações específicas do tenant
        const bedrockResponse = await this.bedrockService.invokeForTenant(
            newMessageDto.tenantId,
            newMessageDto.model, 
            enhancedMessage, 
            tenantSessionId, 
            audioBuffer?.toString('base64'), 
            audioMimeType
        );
        return {
            ...bedrockResponse,
            ...(imageAnalysis && { imageAnalysis })
        };
    }

    private createMedicalImagePrompt(originalMessage: string, imageAnalysis: ImageAnalysisResult): string {
        const context = `
CONTEXTO DA IMAGEM MÉDICA ANALISADA:
- Labels detectados: ${imageAnalysis.labels.map(l => `${l.name} (${l.confidence.toFixed(1)}%)`).join(', ')}
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
