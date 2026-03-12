import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { BedrockToolExecutorService } from './bedrock-tool-executor.service';
import { ValidationResult } from '../../../../database/entities/medical-certificate.entity';
import type { IPdfConverter } from '../../../chat/domain/ports/pdf-converter.interface';
import { PDF_CONVERTER_TOKEN } from '../../../chat/domain/ports/pdf-converter.interface';

// Constante para controlar o delay entre chamadas da API Bedrock (em milissegundos)
// Aumentar este valor se ocorrerem erros de rate limiting em produção
const BEDROCK_API_DELAY_MS = 15000; // 15 segundos para garantir estabilidade
const BEDROCK_INITIAL_DELAY_MS = 5000; // 5 segundos de delay inicial

export interface ValidationContext {
  patientName?: string;
  uploadDate?: Date;
}

export interface ValidationResponse {
  isValid: boolean;
  confidenceScore: number;
  conclusion: string;
  crmValidation: ValidationResult;
  crmObservation: string;
  authenticityValidation: ValidationResult;
  authenticityObservation: string;
  signatureValidation: ValidationResult;
  signatureObservation: string;
  dateValidation: ValidationResult;
  dateObservation: string;
  legibilityValidation: ValidationResult;
  legibilityObservation: string;
}

// Interfaces para análises específicas
interface DateExtractionResponse {
  documentDate: string | null;
  hasDate: boolean;
  confidence: string;
}

interface CRMValidationResponse {
  validation: string;
  crmNumber: string | null;
  observation: string;
}

interface AuthenticityValidationResponse {
  validation: string;
  observation: string;
  fraudSigns: string[];
}

interface SignatureValidationResponse {
  validation: string;
  hasSignature: boolean;
  hasStamp: boolean;
  observation: string;
}

interface LegibilityValidationResponse {
  validation: string;
  missingElements: string[];
  observation: string;
}

interface PeriodValidationResponse {
  validation: string;
  period: string | null;
  periodDays: number | null;
  observation: string;
}

@Injectable()
export class BedrockValidationService {
  private readonly logger = new Logger(BedrockValidationService.name);
  private readonly bedrockClient: BedrockRuntimeClient;
  private readonly modelId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly toolExecutor: BedrockToolExecutorService,
    @Inject(PDF_CONVERTER_TOKEN)
    private readonly pdfConverter: IPdfConverter,
  ) {
    const region = this.configService.get<string>(
      'aws.bedrock.region',
      'us-east-1',
    );
    this.modelId =
      this.configService.get<string>('aws.bedrock.modelId') ||
      'anthropic.claude-3-5-sonnet-20240620-v1:0';

    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    this.bedrockClient = new BedrockRuntimeClient({
      region,
      ...(profile ? { profile } : {}),
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: { accessKeyId, secretAccessKey },
          }
        : {}),
    });
  }

  /**
   * Validação principal - orquestra todas as validações específicas
   */
  async validateMedicalCertificate(
    fileBuffer: Buffer,
    mimeType: string,
    context?: ValidationContext,
  ): Promise<ValidationResponse> {
    try {
      this.logger.log('Iniciando validação modular de atestado médico');

      if (context?.uploadDate) {
        this.logger.log(
          `Data de upload: ${context.uploadDate.toLocaleDateString('pt-BR')}`,
        );
      }

      let base64Image: string;
      let imageMediaType: string;

      // Converter PDF para imagens se necessário
      if (mimeType === 'application/pdf') {
        this.logger.log('PDF detectado - convertendo para imagem...');
        const base64Pdf = fileBuffer.toString('base64');
        const images = await this.pdfConverter.convertToImages(base64Pdf);
        
        if (images.length === 0) {
          throw new Error('PDF não contém páginas válidas');
        }
        
        // Usa a primeira página para validação
        base64Image = images[0].data;
        imageMediaType = images[0].media_type;
        this.logger.log(`PDF convertido - usando primeira página (${images.length} páginas totais)`);
      } else {
        // Imagens são usadas diretamente
        base64Image = fileBuffer.toString('base64');
        imageMediaType = this.getImageMediaType(mimeType);
      }

      // 1. Extração de data
      this.logger.log('Etapa 1/5: Extraindo data...');
      const dateExtraction = await this.extractDocumentDate(
        base64Image,
        imageMediaType,
      );
      this.logger.log(
        `Data: ${dateExtraction.documentDate || 'não encontrada'}`,
      );

      // 2. Validação de data com lógica TypeScript
      const dateValidationResult = this.validateDate(
        dateExtraction,
        context?.uploadDate,
      );

      // 3-7. Outras validações em lotes (evita rate limit)
      this.logger.log('Executando validações sequencialmente (modo conservador)...');

      // Delay inicial menor já que a primeira chamada já tem retry com backoff
      await new Promise((resolve) => setTimeout(resolve, BEDROCK_INITIAL_DELAY_MS));

      // Validações em sequência com delays maiores entre cada uma
      this.logger.log('Validação 1/5: CRM');
      const crmValidation = await this.validateCRM(
        base64Image,
        imageMediaType,
      );
      await new Promise((resolve) => setTimeout(resolve, BEDROCK_API_DELAY_MS));

      this.logger.log('Validação 2/5: Autenticidade');
      const authenticityValidation = await this.validateAuthenticity(
        base64Image,
        imageMediaType,
      );
      await new Promise((resolve) => setTimeout(resolve, BEDROCK_API_DELAY_MS));

      this.logger.log('Validação 3/5: Assinatura');
      const signatureValidation = await this.validateSignature(
        base64Image,
        imageMediaType,
      );
      await new Promise((resolve) => setTimeout(resolve, BEDROCK_API_DELAY_MS));

      this.logger.log('Validação 4/5: Período');
      const periodValidation = await this.validatePeriod(
        base64Image,
        imageMediaType,
      );
      await new Promise((resolve) => setTimeout(resolve, BEDROCK_API_DELAY_MS));

      this.logger.log('Validação 5/5: Legibilidade');
      const legibilityValidation = await this.validateLegibility(
        base64Image,
        imageMediaType,
        context?.patientName,
      );

      // Mapeia resultados
      const crmResult = this.mapValidationResult(crmValidation.validation);
      const authenticityResult = this.mapValidationResult(
        authenticityValidation.validation,
      );
      const signatureResult = this.mapValidationResult(
        signatureValidation.validation,
      );
      const periodResult = this.mapValidationResult(
        periodValidation.validation,
      );
      const legibilityResult = this.mapValidationResult(
        legibilityValidation.validation,
      );

      const confidenceScore = this.calculateConfidenceScore({
        crm: crmResult,
        authenticity: authenticityResult,
        signature: signatureResult,
        date: dateValidationResult.validation,
        period: periodResult,
        legibility: legibilityResult,
      });

      const isValid =
        crmResult !== ValidationResult.INVALID &&
        authenticityResult !== ValidationResult.INVALID &&
        signatureResult !== ValidationResult.INVALID &&
        dateValidationResult.validation !== ValidationResult.INVALID &&
        periodResult !== ValidationResult.INVALID &&
        legibilityResult !== ValidationResult.INVALID;

      // Arredonda o score para manter consistência
      const finalScore = Math.round(confidenceScore);

      // Gera conclusão com IA baseada nas análises específicas
      this.logger.log('Gerando conclusão final com IA...');
      await new Promise((resolve) => setTimeout(resolve, BEDROCK_API_DELAY_MS));
      
      const conclusion = await this.generateAIConclusion(
        isValid,
        finalScore,
        {
          crm: { result: crmResult, observation: crmValidation.observation },
          authenticity: { result: authenticityResult, observation: authenticityValidation.observation },
          signature: { result: signatureResult, observation: signatureValidation.observation },
          date: { result: dateValidationResult.validation, observation: dateValidationResult.observation },
          period: { result: periodResult, observation: periodValidation.observation },
          legibility: { result: legibilityResult, observation: legibilityValidation.observation },
        },
      );

      this.logger.log(
        `Resultado: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'} (${finalScore}%)`,
      );

      return {
        isValid,
        confidenceScore: finalScore,
        conclusion,
        crmValidation: crmResult,
        crmObservation: crmValidation.observation,
        authenticityValidation: authenticityResult,
        authenticityObservation: authenticityValidation.observation,
        signatureValidation: signatureResult,
        signatureObservation: signatureValidation.observation,
        dateValidation: dateValidationResult.validation,
        dateObservation: dateValidationResult.observation,
        legibilityValidation: legibilityResult,
        legibilityObservation: legibilityValidation.observation,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error('Erro na validação', error);
      throw new Error(`Falha na validação: ${errorMessage}`);
    }
  }

  /**
   * Extrai data do documento
   */
  private async extractDocumentDate(
    base64Image: string,
    imageMediaType: string,
  ): Promise<DateExtractionResponse> {
    const prompt = `Analise o atestado médico e EXTRAIA APENAS a data do documento.

IMPORTANTE: Retorne a data EXATAMENTE como está escrita no documento, sem interpretações.

Procure por:
- Data de emissão do atestado
- Data em que o atestado foi emitido/feito
- Formato comum: DD/MM/YYYY, DD/MM/YY, DD/MM/AA

Retorne APENAS JSON (sem markdown, sem \`\`\`):
{
  "documentDate": "DD/MM/YYYY ou DD/MM/YY ou null",
  "hasDate": true/false,
  "confidence": "high/medium/low"
}

Exemplos:
- "01/07/2025" → {"documentDate": "01/07/2025", "hasDate": true, "confidence": "high"}
- "17/07/23" → {"documentDate": "17/07/23", "hasDate": true, "confidence": "high"}
- "20/12/2024" → {"documentDate": "20/12/2024", "hasDate": true, "confidence": "high"}
- Não encontrar → {"documentDate": null, "hasDate": false, "confidence": "low"}`;

    const response = await this.invokeModel(
      base64Image,
      imageMediaType,
      prompt,
    );
    return this.parseJSON<DateExtractionResponse>(response, {
      documentDate: null,
      hasDate: false,
      confidence: 'low',
    });
  }

  /**
   * Valida data com lógica TypeScript
   */
  private validateDate(
    extraction: DateExtractionResponse,
    uploadDate?: Date,
  ): { validation: ValidationResult; observation: string } {
    if (!extraction.hasDate || !extraction.documentDate) {
      return {
        validation: ValidationResult.INVALID,
        observation: 'Data do documento não encontrada.',
      };
    }

    if (!uploadDate) {
      return {
        validation: ValidationResult.WARNING,
        observation: `Data: ${extraction.documentDate}. Upload date não fornecida para validação.`,
      };
    }

    try {
      const documentDate = this.parseDocumentDate(extraction.documentDate);

      if (!documentDate) {
        return {
          validation: ValidationResult.INVALID,
          observation: `Data inválida: ${extraction.documentDate}`,
        };
      }

      const uploadDateOnly = new Date(
        uploadDate.getFullYear(),
        uploadDate.getMonth(),
        uploadDate.getDate(),
      );
      const documentDateOnly = new Date(
        documentDate.getFullYear(),
        documentDate.getMonth(),
        documentDate.getDate(),
      );

      // Data futura
      if (documentDateOnly > uploadDateOnly) {
        return {
          validation: ValidationResult.INVALID,
          observation: `Data do documento (${documentDate.toLocaleDateString('pt-BR')}) é POSTERIOR ao upload (${uploadDate.toLocaleDateString('pt-BR')}). IMPOSSÍVEL - possível fraude.`,
        };
      }

      // Muito antiga
      const diffDays = Math.floor(
        (uploadDateOnly.getTime() - documentDateOnly.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const diffMonths = diffDays / 30;

      if (diffMonths > 24) {
        return {
          validation: ValidationResult.INVALID,
          observation: `Data muito antiga (${documentDate.toLocaleDateString('pt-BR')}) - mais de 2 anos. Suspeita de reutilização.`,
        };
      }

      if (diffMonths > 12) {
        return {
          validation: ValidationResult.WARNING,
          observation: `Data antiga (${documentDate.toLocaleDateString('pt-BR')}) - mais de 1 ano.`,
        };
      }

      return {
        validation: ValidationResult.VALID,
        observation: `Data válida: ${documentDate.toLocaleDateString('pt-BR')} (${diffDays} dias antes do upload).`,
      };
    } catch (error) {
      return {
        validation: ValidationResult.INVALID,
        observation: `Erro ao processar data: ${extraction.documentDate}`,
      };
    }
  }

  /**
   * Parse inteligente de data
   */
  private parseDocumentDate(dateString: string): Date | null {
    try {
      const match = dateString
        .trim()
        .match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
      if (!match) return null;

      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      let year = parseInt(match[3], 10);

      // Trata ano abreviado
      if (year < 100) {
        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        const currentYearShort = currentYear % 100;

        // Anos 00-36 = 2000-2036, acima = 1900s
        const originalYear = year;
        year = year <= 36 ? currentCentury + year : currentCentury - 100 + year;
        this.logger.debug(
          `Ano abreviado ${originalYear} interpretado como ${year}`,
        );
      }

      const date = new Date(year, month, day);

      // Valida
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
      ) {
        return null;
      }

      return date;
    } catch (error) {
      return null;
    }
  }

  private async validateCRM(
    base64Image: string,
    imageMediaType: string,
  ): Promise<CRMValidationResponse> {
    const prompt = `Analise o atestado médico e valide APENAS o CRM (registro profissional do médico).

Procure por:
- Número do CRM (pode estar no carimbo, cabeçalho ou rodapé)
- Formato: CRM/UF XXXXXX ou apenas números
- UF/Estado (ex: SP, RJ, MG)
- Nome do médico no documento
- Legibilidade do CRM

IMPORTANTE: Você tem acesso a uma ferramenta para validar o CRM:
- "validate_crm_online": Valida o CRM online contra a base de dados CFM via TRYA Platform API

FLUXO:
1. Extraia o número do CRM e o código do estado (UF) da imagem
2. Use "validate_crm_online" passando crm_number e state_code (OBRIGATÓRIO em MAIÚSCULAS)
3. A ferramenta retorna: nome do médico e situação profissional CFM
4. Analise o resultado:
   - Compare o nome retornado com o nome visível no atestado
   - Verifique a situação profissional
5. Retorne o JSON com a validação do CRM

Retorne APENAS JSON (sem markdown, sem texto explicativo antes/depois):
{
  "validation": "VALID/WARNING/INVALID",
  "crmNumber": "número encontrado ou null",
  "observation": "análise detalhada DO CRM com base na validação CFM"
}

Critérios de validação DO CRM:
- VALID: CRM encontrado no CFM, situação regular (A), nome confere
- WARNING: CRM encontrado mas situação especial (transferido, aposentado) OU nome não confere exatamente
- INVALID: CRM não encontrado no CFM, número ilegível, cassado, cancelado ou suspenso

ATENÇÃO: Avalie APENAS o CRM. Não comente sobre outros elementos do atestado.`;

    const response = await this.invokeModelWithToolSupport(
      base64Image,
      imageMediaType,
      prompt,
    );
    return this.parseJSON<CRMValidationResponse>(response, {
      validation: 'INVALID',
      crmNumber: null,
      observation: 'Erro ao validar CRM',
    });
  }

  private async validateAuthenticity(
    base64Image: string,
    imageMediaType: string,
  ): Promise<AuthenticityValidationResponse> {
    const prompt = `Analise o atestado médico quanto a FRAUDE e AUTENTICIDADE.

Procure por:
1. Edição digital (fontes inconsistentes, textos sobrepostos)
2. Photoshop (bordas mal recortadas, sombras estranhas)
3. Qualidade inconsistente (resoluções diferentes)
4. Elementos de segurança (papel timbrado, logo, cabeçalho)
5. Rasuras ou alterações visíveis

Retorne APENAS JSON (sem markdown):
{
  "validation": "VALID/WARNING/INVALID",
  "observation": "análise detalhada",
  "fraudSigns": ["lista de sinais de fraude ou []"]
}

Critérios:
- VALID: Documento genuíno, sem adulteração
- WARNING: Qualidade baixa mas sem fraude óbvia
- INVALID: Sinais claros de edição/fraude`;

    const response = await this.invokeModel(
      base64Image,
      imageMediaType,
      prompt,
    );
    return this.parseJSON<AuthenticityValidationResponse>(response, {
      validation: 'INVALID',
      observation: 'Erro',
      fraudSigns: [],
    });
  }

  private async validateSignature(
    base64Image: string,
    imageMediaType: string,
  ): Promise<SignatureValidationResponse> {
    const prompt = `Analise ASSINATURA e CARIMBO do atestado.

IMPORTANTE: No Brasil é válido ter:
- Apenas assinatura manuscrita OU
- Apenas carimbo médico OU
- Ambos

Analise:
1. Assinatura: presente? parece natural?
2. Carimbo: presente? legível? tem CRM/nome?

Retorne APENAS JSON (sem markdown):
{
  "validation": "VALID/WARNING/INVALID",
  "hasSignature": true/false,
  "hasStamp": true/false,
  "observation": "análise detalhada"
}

Critérios:
- VALID: Tem assinatura E/OU carimbo legível
- WARNING: Presente mas pouco legível
- INVALID: Sem assinatura E sem carimbo`;

    const response = await this.invokeModel(
      base64Image,
      imageMediaType,
      prompt,
    );
    return this.parseJSON<SignatureValidationResponse>(response, {
      validation: 'INVALID',
      hasSignature: false,
      hasStamp: false,
      observation: 'Erro',
    });
  }

  private async validatePeriod(
    base64Image: string,
    imageMediaType: string,
  ): Promise<PeriodValidationResponse> {
    const prompt = `Analise o PERÍODO DE AFASTAMENTO do atestado médico.

Procure por:
- Número de dias de afastamento/repouso
- Data inicial e final do período
- Frases como "X dias de repouso", "afastamento de X dias"

Retorne APENAS JSON (sem markdown):
{
  "validation": "VALID/WARNING/INVALID",
  "period": "texto do período encontrado ou null",
  "periodDays": número de dias ou null,
  "observation": "análise detalhada"
}

Critérios:
- VALID: Período claramente especificado, razoável (1-15 dias típico)
- WARNING: Período longo (16-30 dias) mas presente
- INVALID: 
  * Período ausente
  * Período excessivamente longo (>30 dias) sem justificativa
  * Período incoerente ou ilegível`;

    const response = await this.invokeModel(
      base64Image,
      imageMediaType,
      prompt,
    );
    return this.parseJSON<PeriodValidationResponse>(response, {
      validation: 'INVALID',
      period: null,
      periodDays: null,
      observation: 'Erro',
    });
  }

  private async validateLegibility(
    base64Image: string,
    imageMediaType: string,
    patientName?: string,
  ): Promise<LegibilityValidationResponse> {
    const context = patientName
      ? `\n\nNome esperado do paciente: "${patientName}"\nVerifique se corresponde (variações aceitáveis).`
      : '';
    const prompt = `Analise LEGIBILIDADE e ELEMENTOS ESSENCIAIS do atestado.${context}

Verifique:
1. Nome do paciente (obrigatório)
2. Texto geral legível e compreensível
3. CID (opcional mas desejável)
4. Identificação da clínica/hospital:
   - Cabeçalho com nome da instituição
   - Endereço, telefone ou CNPJ
   - Logo ou identidade visual profissional
   - **ATENÇÃO**: Falta TOTAL de identificação institucional é suspeita
5. Qualidade geral:
   - Sem partes cortadas ou borradas intencionalmente
   - Resolução permite leitura completa
   - Sem sobreposições ou textos ilegíveis

Retorne APENAS JSON (sem markdown):
{
  "validation": "VALID/WARNING/INVALID",
  "missingElements": ["lista de elementos faltantes ou []"],
  "observation": "análise detalhada incluindo elementos institucionais${patientName ? ' e validação de nome do paciente' : ''}"
}

Critérios:
- VALID: Todos elementos essenciais presentes e legíveis, instituição identificada
- WARNING: Um elemento faltante mas documento compreensível
- INVALID: 
  * Múltiplos elementos essenciais faltantes
  * Ilegível em partes críticas
  * Sem identificação institucional (sem cabeçalho, logo, dados da clínica)`;

    const response = await this.invokeModel(
      base64Image,
      imageMediaType,
      prompt,
    );
    return this.parseJSON<LegibilityValidationResponse>(response, {
      validation: 'INVALID',
      missingElements: [],
      observation: 'Erro',
    });
  }

  /**
   * Envia mensagens para Bedrock com suporte a Tool Use
   * Implementa retry com exponential backoff
   */
  private async sendMessageToBedrock(
    messages: any[],
    tools?: any[],
  ): Promise<any> {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      temperature: 0.2,
      messages,
      ...(tools && { tools }),
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    // Retry com exponential backoff
    const maxRetries = 5;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        return responseBody;
      } catch (error: any) {
        lastError = error;
        const isThrottling =
          error.message?.includes('Too many requests') ||
          error.message?.includes('throttl') ||
          error.name === 'ThrottlingException' ||
          error.$metadata?.httpStatusCode === 429;

        if (isThrottling && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 5000;
          this.logger.warn(
            `Rate limit ao enviar para Bedrock, aguardando ${delay / 1000}s (tentativa ${attempt + 1}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    if (lastError) {
      const isThrottling =
        lastError.message?.includes('Too many requests') ||
        lastError.message?.includes('throttl') ||
        lastError.name === 'ThrottlingException' ||
        (lastError as any).$metadata?.httpStatusCode === 429;

      if (isThrottling) {
        throw new Error(
          'Serviço de validação congestionado. Por favor, tente novamente em alguns minutos.',
        );
      }
      throw lastError;
    }

    throw new Error('Falha ao comunicar com o serviço de validação');
  }

  /**
   * Invoca o modelo com suporte a Tool Use (Function Calling)
   * Itera até que Claude não solicite mais ferramentas
   */
  private async invokeModelWithToolSupport(
    base64Image: string,
    imageMediaType: string,
    prompt: string,
  ): Promise<string> {
    const messages: any[] = [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageMediaType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ];

    const tools = this.toolExecutor.getToolDefinitions();
    let finalResponse = '';

    // Loop de Tool Use até que Claude não solicite mais ferramentas
    for (let iteration = 0; iteration < 10; iteration++) {
      this.logger.debug(
        `[Tool Use] Iteração ${iteration + 1}: Enviando para Bedrock...`,
      );

      const response = await this.sendMessageToBedrock(messages, tools);
      const content = response.content;

      if (!content || content.length === 0) {
        break;
      }

      // Processa blocos de conteúdo
      let hasToolUse = false;

      for (const block of content) {
        if (block.type === 'text') {
          finalResponse = block.text;
        } else if (block.type === 'tool_use') {
          hasToolUse = true;
          const toolName = block.name;
          const toolInput = block.input;

          this.logger.debug(
            `[Tool Use] Claude solicitou ferramenta: ${toolName}`,
          );

          try {
            // Executa a ferramenta
            const toolResult = await this.toolExecutor.executeTool(
              toolName,
              toolInput,
            );

            this.logger.debug(
              `[Tool Use] Ferramenta ${toolName} executada com sucesso`,
            );

            // Adiciona resposta de assistente e resultado de ferramenta ao histórico
            messages.push({
              role: 'assistant',
              content: content,
            });

            messages.push({
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: toolResult,
                },
              ],
            });
          } catch (error: any) {
            this.logger.error(
              `Erro ao executar ferramenta ${toolName}: ${error.message}`,
            );

            // Envia erro de volta ao Claude
            messages.push({
              role: 'assistant',
              content: content,
            });

            messages.push({
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify({
                    error: error.message,
                    shouldReviewManually: true,
                  }),
                  is_error: true,
                },
              ],
            });
          }
        }
      }

      // Se não houve tool_use, Claude terminou a iteração
      if (!hasToolUse) {
        break;
      }
    }

    return finalResponse;
  }

  private async invokeModel(
    base64Image: string,
    imageMediaType: string,
    prompt: string,
  ): Promise<string> {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageMediaType,
                data: base64Image,
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    // Retry com exponential backoff para rate limiting
    const maxRetries = 5; // Aumentado de 3 para 5 tentativas
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        return responseBody.content[0].text;
      } catch (error: any) {
        lastError = error;
        const isThrottling =
          error.message?.includes('Too many requests') ||
          error.message?.includes('throttl') ||
          error.name === 'ThrottlingException' ||
          error.$metadata?.httpStatusCode === 429;

        if (isThrottling && attempt < maxRetries) {
          // Exponential backoff mais agressivo: 5s, 10s, 20s, 40s, 80s
          const delay = Math.pow(2, attempt) * 5000;
          this.logger.warn(
            `Rate limit atingido, aguardando ${delay / 1000}s antes de tentar novamente (tentativa ${attempt + 1}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    // Mensagem de erro mais amigável
    if (lastError) {
      const isThrottling =
        lastError.message?.includes('Too many requests') ||
        lastError.message?.includes('throttl') ||
        lastError.name === 'ThrottlingException' ||
        (lastError as any).$metadata?.httpStatusCode === 429;

      if (isThrottling) {
        throw new Error(
          'O serviço está processando muitas solicitações no momento. Por favor, aguarde alguns minutos e tente novamente.',
        );
      }
      throw lastError;
    }

    throw new Error('Falha ao invocar modelo');
  }

  private parseJSON<T>(responseText: string, fallback: T): T {
    try {
      let cleaned = responseText.trim();
      
      // Remove markdown code blocks
      cleaned = cleaned
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '');
      
      // Tenta extrair JSON de texto com explicações
      // Procura por { ... } no texto
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      return JSON.parse(cleaned) as T;
    } catch (error) {
      this.logger.error('Parse error - Response:', responseText);
      this.logger.error('Parse error - Details:', error instanceof Error ? error.message : 'Unknown error');
      return fallback;
    }
  }

  private calculateConfidenceScore(
    validations: Record<string, ValidationResult>,
  ): number {
    let score = 0;
    const weights = {
      crm: 15,
      authenticity: 25,
      signature: 15,
      date: 20,
      period: 10,
      legibility: 15,
    };

    Object.entries(weights).forEach(([key, weight]) => {
      const result = validations[key];
      if (result === ValidationResult.VALID) score += weight;
      else if (result === ValidationResult.WARNING) score += weight * 0.5;
    });

    return score;
  }

  /**
   * Gera conclusão inteligente usando o Bedrock baseada nas análises específicas
   */
  private async generateAIConclusion(
    isValid: boolean,
    score: number,
    validations: Record<
      string,
      { result: ValidationResult; observation: string }
    >,
  ): Promise<string> {
    const statusGeral = isValid ? 'VÁLIDO' : 'INVÁLIDO';
    
    // Monta resumo das validações para o prompt
    const validationsSummary = Object.entries(validations)
      .map(([key, val]) => {
        const statusMap = {
          [ValidationResult.VALID]: 'VÁLIDO',
          [ValidationResult.WARNING]: 'ATENÇÃO',
          [ValidationResult.INVALID]: 'INVÁLIDO',
        };
        const status = statusMap[val.result] || 'INDEFINIDO';
        return `- ${key.toUpperCase()}: ${status}\n  ${val.observation}`;
      })
      .join('\n\n');

    const prompt = `Você é um analista especializado em validação de atestados médicos.

Com base nas seguintes análises detalhadas de um atestado médico, gere uma CONCLUSÃO FINAL em português do Brasil:

RESULTADO GERAL: ${statusGeral}
SCORE DE CONFIANÇA: ${score}%

ANÁLISES INDIVIDUAIS:
${validationsSummary}

Gere uma conclusão em português seguindo este formato EXATO (2-3 linhas):
- Primeira linha: Status geral e score
- Segunda linha: Principais problemas ou pontos positivos
- Terceira linha: Recomendação clara

EXEMPLOS:

Para inválido:
"ATESTADO INVÁLIDO - Score: 20%. O documento apresenta problemas críticos como ausência de CRM, falta de assinatura/carimbo médico e data não identificada, tornando impossível sua validação. Recomenda-se solicitar novo atestado ao beneficiário com todos os elementos obrigatórios preenchidos."

Para válido com ressalvas:
"ATESTADO VÁLIDO COM RESSALVAS - Score: 65%. O documento contém os elementos essenciais (CRM, assinatura), porém apresenta legibilidade reduzida em algumas áreas e falta identificação completa da instituição. Recomenda-se análise manual complementar antes da aprovação final."

Para válido:
"ATESTADO VÁLIDO - Score: 95%. O documento atende plenamente aos requisitos, apresentando CRM legível, assinatura/carimbo médico válidos, data correta e todos os elementos de autenticidade. Aprovado para processamento imediato."

Retorne APENAS o texto da conclusão (sem aspas, sem JSON, sem markdown).`;

    try {
      const conclusion = await this.invokeModelTextOnly(prompt);
      return conclusion.trim();
    } catch (error) {
      this.logger.error('Erro ao gerar conclusão com IA, usando fallback', error);
      // Fallback caso o Bedrock falhe
      return this.generateFallbackConclusion(isValid, score, validations);
    }
  }

  /**
   * Invoca o modelo sem imagem (apenas texto)
   */
  private async invokeModelTextOnly(prompt: string): Promise<string> {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }],
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await this.bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  }

  /**
   * Conclusão fallback caso a IA falhe
   */
  private generateFallbackConclusion(
    isValid: boolean,
    score: number,
    validations: Record<
      string,
      { result: ValidationResult; observation: string }
    >,
  ): string {
    const fieldTranslations: Record<string, string> = {
      crm: 'CRM',
      authenticity: 'autenticidade',
      signature: 'assinatura',
      date: 'data',
      period: 'período',
      legibility: 'legibilidade',
    };

    if (!isValid) {
      const issues = Object.entries(validations)
        .filter(([_, v]) => v.result === ValidationResult.INVALID)
        .map(([k]) => fieldTranslations[k] || k);
      
      return `ATESTADO INVÁLIDO - Score: ${score}%. O documento apresenta problemas críticos em: ${issues.join(', ')}. Recomenda-se solicitar novo atestado ao beneficiário.`;
    }

    const warnings = Object.entries(validations)
      .filter(([_, v]) => v.result === ValidationResult.WARNING);

    if (warnings.length > 0) {
      const warningFields = warnings.map(([k]) => fieldTranslations[k] || k);
      return `ATESTADO VÁLIDO COM RESSALVAS - Score: ${score}%. O documento atende aos requisitos mínimos, porém apresenta ressalvas em: ${warningFields.join(', ')}. Recomenda-se análise manual para confirmação.`;
    }

    return `ATESTADO VÁLIDO - Score: ${score}%. O documento atende a todos os requisitos de validação. Aprovado para processamento.`;
  }

  private generateConclusion(
    isValid: boolean,
    score: number,
    validations: Record<string, ValidationResult>,
  ): string {
    // Mapa de tradução dos campos de validação
    const fieldTranslations: Record<string, string> = {
      crm: 'CRM',
      authenticity: 'autenticidade',
      signature: 'assinatura',
      date: 'data',
      period: 'período',
      legibility: 'legibilidade',
    };

    // Descrições amigáveis dos problemas
    const issueDescriptions: Record<string, string> = {
      crm: 'registro profissional não identificado',
      authenticity: 'sinais de possível adulteração',
      signature: 'ausência de assinatura ou carimbo',
      date: 'data inválida ou ausente',
      period: 'período de afastamento não especificado adequadamente',
      legibility: 'documento ilegível ou incompleto',
    };

    if (!isValid) {
      const invalidFields = Object.entries(validations)
        .filter(([_, v]) => v === ValidationResult.INVALID);
      
      const issues = invalidFields.map(([k]) => fieldTranslations[k] || k);
      const mainIssue = invalidFields[0] ? issueDescriptions[invalidFields[0][0]] : 'problemas detectados';
      
      const conclusion = `ATESTADO INVÁLIDO - Score de confiança: ${score}%. ` +
        `O documento apresenta problemas críticos em: ${issues.join(', ')}. ` +
        `Principal irregularidade: ${mainIssue}. ` +
        `Recomenda-se solicitar novo atestado ao beneficiário.`;
      
      return conclusion;
    }

    const warnings = Object.entries(validations)
      .filter(([_, v]) => v === ValidationResult.WARNING);

    if (warnings.length > 0) {
      const warningFields = warnings.map(([k]) => fieldTranslations[k] || k);
      const conclusion = `ATESTADO VÁLIDO COM RESSALVAS - Score de confiança: ${score}%. ` +
        `O documento atende aos requisitos mínimos, porém apresenta ressalvas em: ${warningFields.join(', ')}. ` +
        `Recomenda-se análise manual para confirmação final.`;
      
      return conclusion;
    }

    return `ATESTADO VÁLIDO - Score de confiança: ${score}%. ` +
      `O documento atende a todos os requisitos de validação, incluindo elementos essenciais como ${Object.keys(validations).slice(0, 3).map(k => fieldTranslations[k] || k).join(', ')}. ` +
      `Aprovado para processamento.`;
  }

  private mapValidationResult(value: string): ValidationResult {
    switch (value?.toUpperCase()) {
      case 'VALID':
        return ValidationResult.VALID;
      case 'WARNING':
        return ValidationResult.WARNING;
      default:
        return ValidationResult.INVALID;
    }
  }

  private getImageMediaType(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'image/jpeg',
      'image/jpg': 'image/jpeg',
      'image/png': 'image/png',
      'application/pdf': 'application/pdf',
    };
    return map[mimeType.toLowerCase()] || 'image/jpeg';
  }
}
