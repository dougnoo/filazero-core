import { Injectable, BadRequestException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { IMedicalImageAnalyzer, IResponseParser, IRateLimiter } from '../domain/interfaces';
import { ImageMetadata } from '../domain/image-metadata.entity';
import { MedicalImageAnalysis } from '../domain/medical-image-analysis.entity';
import { RATE_LIMITER_TOKEN, RESPONSE_PARSER_TOKEN } from '../tokens';

/**
 * Infrastructure adapter for Claude 3.5 Sonnet vision analysis
 * Implements medical image analysis using AWS Bedrock
 */
@Injectable()
export class ClaudeVisionAdapter implements IMedicalImageAnalyzer {
  private bedrockClient: BedrockRuntimeClient;
  private readonly modelId = 'us.anthropic.claude-3-5-sonnet-20241022-v2:0';
  private readonly logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    @Inject(RATE_LIMITER_TOKEN) private readonly rateLimiter: IRateLimiter,
    @Inject(RESPONSE_PARSER_TOKEN) private readonly responseParser: IResponseParser,
  ) {
    this.initializeClient();
    this.logger = new Logger(ClaudeVisionAdapter.name);
  }

  private initializeClient(): void {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const runtime = this.configService.get<string>('AWS_RUNTIME', 'aws');
    const profile = this.configService.get<string>('AWS_PROFILE', 'default');

    console.log(`🔧 Configuring BedrockRuntimeClient - Runtime: ${runtime}, Region: ${region}, Profile: ${profile}`);

    try {
      if (runtime === 'local') {
        const { fromIni } = require('@aws-sdk/credential-providers');
        this.bedrockClient = new BedrockRuntimeClient({
          region,
          credentials: fromIni({ profile }),
        });
      } else {
        this.bedrockClient = new BedrockRuntimeClient({ region });
      }
      console.log('✅ BedrockRuntimeClient configured successfully');
    } catch (error) {
      console.error('❌ Error configuring BedrockRuntimeClient:', error);
      throw error;
    }
  }

  async analyzeImage(
    imageMetadata: ImageMetadata,
    tenantId: string,
  ): Promise<MedicalImageAnalysis> {
    try {
      console.log(`🔍 Analyzing medical image via Claude 3.5 Sonnet for tenant: ${tenantId}`);

      // Apply rate limiting
      await this.rateLimiter.waitForSlot();

      // Prepare Claude payload
      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: this.getMedicalAnalysisPrompt(),
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageMetadata.mimeType,
                  data: imageMetadata.toBase64(),
                },
              },
            ],
          },
        ],
      };

      // Invoke Claude
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      });

      const requestStart = Date.now();
      console.log('📤 Sending request to Claude 3.5 Sonnet...');
      const response = await this.bedrockClient.send(command);
      const requestDuration = Date.now() - requestStart;
      console.log(`📥 Response received from Claude 3.5 Sonnet in ${requestDuration}ms`);

      // Parse response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      const responseText = responseBody.content?.[0]?.text || '';

      this.logger.log(`📥 Response from Claude 3.5 Sonnet: ${responseText}`);

      if (!responseText) {
        throw new Error('Empty response from Claude');
      }

      return this.responseParser.parse(responseText);
    } catch (error) {
      console.error('Error in medical image analysis via Claude:', error);
      this.handleAnalysisError(error);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      return !!this.bedrockClient;
    } catch {
      return false;
    }
  }

  private getMedicalAnalysisPrompt(): string {
    return `
Você é um assistente de TRIAGEM MÉDICA. Sua função é fazer uma avaliação preliminar generalista para orientar sobre a urgência do atendimento médico necessário.

INSTRUÇÕES DE TRIAGEM:
1. Examine a imagem de forma GENERALISTA buscando qualquer sinal que indique necessidade médica:
   - Ferimentos visíveis (cortes, lacerações, perfurações)
   - Traumatismos (hematomas, contusões, inchaços)
   - Queimaduras ou lesões térmicas
   - Alterações na pele (vermelhidão, erupções, manchas anômalas)
   - Sinais de infecção (pus, inflamação severa)
   - Qualquer anormalidade que chame atenção

2. CLASSIFIQUE a urgência baseada em critérios de triagem hospitalar:
   - LOW: Pode aguardar consulta de rotina ou cuidados domiciliares
   - MEDIUM: Deve procurar atendimento médico em 24-48h
   - HIGH: Necessita atendimento médico no mesmo dia
   - CRITICAL: Emergência - procurar pronto-socorro imediatamente

3. Forneça sua resposta no seguinte formato JSON:
{
  "isAppropriate": true/false,
  "detectedFindings": [
    {"name": "descrição do achado", "confidence": 0.0-1.0}
  ],
  "medicalKeywords": ["palavra1", "palavra2"],
  "textContent": "qualquer texto visível na imagem",
  "urgencyLevel": "LOW/MEDIUM/HIGH/CRITICAL",
  "assessment": "descrição detalhada dos achados e recomendações"
}

DIRETRIZES DE TRIAGEM:
- Se a imagem não mostrar condição médica relevante, defina "isAppropriate": false
- Use abordagem GENERALISTA - não tente diagnosticar condições específicas
- Seja CONSERVADOR - na dúvida, classifique com urgência maior
- Foque em ORIENTAR sobre tipo e timing do atendimento médico necessário
- Inclua orientações básicas de primeiros socorros quando apropriado
- NUNCA forneça diagnósticos - apenas triagem de urgência
- Lembre que é apenas uma AVALIAÇÃO PRELIMINAR para orientação

Analise a imagem agora:
    `.trim();
  }

  private handleAnalysisError(error: any): never {
    if (error.message && error.message.includes('credential')) {
      console.error('❌ AWS credentials error. Check:');
      console.error('1. AWS_REGION is set');
      console.error('2. AWS_PROFILE is configured (for runtime=local)');
      console.error('3. AWS credentials are valid (~/.aws/credentials)');
      console.error('4. Bedrock permissions are correct');
      throw new BadRequestException('AWS configuration error. Check credentials.');
    }

    if (error.message && (error.message.includes('ThrottlingException') || error.message.includes('ServiceQuotaExceededException'))) {
      console.error(`⏰ Rate limit exceeded. Current queue: ${this.rateLimiter.getStatus().queueLength} requests`);
      throw new BadRequestException('System temporarily overloaded. Try again in a few seconds.');
    }

    if (error.message && error.message.includes('ValidationException')) {
      throw new BadRequestException('Validation error in image analysis. Check image format.');
    }

    throw new BadRequestException('Error analyzing medical image. Please try again.');
  }
}
