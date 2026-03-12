import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { 
  AnalyzeMedicalImageUseCase 
} from './application/use-cases/analyze-medical-image.use-case';
import { 
  ValidateImageFormatUseCase 
} from './application/use-cases/validate-image-format.use-case';
import { 
  IRateLimiter 
} from './domain/interfaces/rate-limiter.interface';
import { RATE_LIMITER_TOKEN } from './tokens';
import { TenantConfig } from '../tenant/tenant.service';

// Interface de resposta mantida para compatibilidade
export interface ImageAnalysisResult {
  isAppropriate: boolean;
  labels: Array<{ name: string; confidence: number }>;
  medicalKeywords: string[];
  textContent?: string;
  medicalAssessment: string;
  disclaimer: string;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Facade Service para análise de imagens médicas
 * 
 * Mantém interface pública compatível para ChatGateway e outros consumidores,
 * mas delega toda lógica de negócio para use cases da camada de aplicação.
 * 
 * Responsabilidades:
 * - Manter API pública estável
 * - Orquestrar chamadas aos use cases
 * - Converter entre domain entities e DTOs legados
 */
@Injectable()
export class MedicalImageService {
  constructor(
    private readonly analyzeMedicalImageUseCase: AnalyzeMedicalImageUseCase,
    private readonly validateImageFormatUseCase: ValidateImageFormatUseCase,
    @Inject(RATE_LIMITER_TOKEN) private readonly rateLimiter: IRateLimiter,
  ) {}

  /**
   * Analisa imagem médica usando Claude 3.5 Sonnet
   * 
   * @param imageBuffer - Buffer da imagem
   * @param mimeType - Tipo MIME (image/jpeg, image/png)
   * @param tenantConfig - Configuração do tenant
   * @returns Resultado da análise de triagem
   */
  async analyzeImage(
    imageBuffer: Buffer,
    mimeType: string,
    tenantConfig: TenantConfig,
  ): Promise<ImageAnalysisResult> {
    try {
      // Validar formato da imagem
      const formatValidation = this.validateImageFormatUseCase.execute(
        mimeType,
        imageBuffer,
      );

      if (!formatValidation.isValid) {
        throw new BadRequestException(formatValidation.errors.join('; '));
      }

      // Executar análise via use case
      const analysisResult = await this.analyzeMedicalImageUseCase.execute(
        imageBuffer,
        mimeType,
        tenantConfig.name, // usando name como tenantId
      );

      // Converter domain entity para interface legada
      return {
        isAppropriate: analysisResult.isAppropriate,
        labels: analysisResult.findings.map(finding => ({
          name: finding.name,
          confidence: finding.confidence,
        })),
        medicalKeywords: analysisResult.medicalKeywords,
        textContent: analysisResult.textContent || '',
        medicalAssessment: analysisResult.assessment,
        disclaimer: analysisResult.getDisclaimer(),
        urgencyLevel: analysisResult.urgencyLevel,
      };
    } catch (error) {
      // Propagar erros conhecidos
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Logar e converter erros desconhecidos
      console.error('Erro inesperado na análise de imagem:', error);
      throw new BadRequestException(
        'Erro ao analisar imagem médica. Tente novamente.',
      );
    }
  }

  /**
   * Valida se o formato da imagem é suportado
   * 
   * @param mimeType - Tipo MIME da imagem
   * @returns true se formato é válido
   */
  isValidMedicalImageFormat(mimeType: string): boolean {
    return this.validateImageFormatUseCase.isValidFormat(mimeType);
  }

  /**
   * Valida se o tamanho da imagem está dentro dos limites
   * 
   * @param buffer - Buffer da imagem
   * @returns true se tamanho é válido
   */
  isValidImageSize(buffer: Buffer): boolean {
    return this.validateImageFormatUseCase.isValidSize(buffer);
  }

  /**
   * Obtém status atual do rate limiting
   * 
   * @returns Informações sobre rate limit e fila
   */
  getRateLimitStatus(): {
    maxRequestsPerMinute: number;
    requestDelayMs: number;
    queueLength: number;
    timeSinceLastRequest: number;
    nextRequestAvailableIn: number;
  } {
    return this.rateLimiter.getStatus();
  }
}
