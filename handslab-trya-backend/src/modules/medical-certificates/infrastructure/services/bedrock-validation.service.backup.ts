import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { ValidationResult } from '../../../../database/entities/medical-certificate.entity';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

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

@Injectable()
export class BedrockValidationService {
  private readonly logger = new Logger(BedrockValidationService.name);
  private readonly bedrockClient: BedrockRuntimeClient;
  private readonly modelId: string;

  constructor(private readonly configService: ConfigService) {
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

  async validateMedicalCertificate(
    fileBuffer: Buffer,
    mimeType: string,
    context?: ValidationContext,
  ): Promise<ValidationResponse> {
    try {
      this.logger.log('Iniciando validação de atestado médico com Bedrock');

      if (context?.uploadDate) {
        this.logger.log(
          `Data de upload para validação: ${context.uploadDate.toLocaleDateString('pt-BR')} (${context.uploadDate.toISOString()})`,
        );
      }

      let imageBuffer = fileBuffer;
      let imageMediaType = this.getImageMediaType(mimeType);

      // Se for PDF, converte para imagem
      if (mimeType === 'application/pdf') {
        this.logger.log('Detectado PDF, convertendo para imagem...');
        imageBuffer = await this.convertPdfToImage(fileBuffer);
        imageMediaType = 'image/jpeg';
        this.logger.log('PDF convertido para JPEG com sucesso');
      }

      const base64Image = imageBuffer.toString('base64');
      const prompt = this.buildValidationPrompt(context);

      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
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
              {
                type: 'text',
                text: prompt,
              },
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

      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      this.logger.log('Resposta recebida do Bedrock');

      return this.parseValidationResponse(responseBody.content[0].text);
    } catch (error) {
      this.logger.error('Erro ao validar atestado médico com Bedrock', error);
      throw new Error('Falha na validação do atestado médico');
    }
  }

  private buildValidationPrompt(context?: ValidationContext): string {
    const patientNameInstruction = context?.patientName
      ? `\n\n**VALIDAÇÃO CRÍTICA DE NOME DO PACIENTE**:\n- Nome esperado do paciente: "${context.patientName}"\n- Verifique se o nome no atestado corresponde ou é similar ao esperado\n- Pequenas variações são aceitáveis (abreviações, ordem dos nomes, acentuação)\n- Diferenças significativas devem ser marcadas como WARNING ou INVALID\n- Se o nome for completamente diferente, marque como INVALID`
      : '';

    const uploadDateInfo = context?.uploadDate
      ? `\n\n**VALIDAÇÃO DE DATA DO DOCUMENTO**:\n- Data de upload do atestado no sistema: ${context.uploadDate.toLocaleDateString('pt-BR')} (ano ${context.uploadDate.getFullYear()})\n- **ATENÇÃO SOBRE FORMATO DE ANO**: Se o documento tiver ano abreviado (ex: 25, 24), considere o contexto:\n  - Anos 24, 25, 26 = 2024, 2025, 2026 (década de 2020)\n  - Anos 99, 00, 01 = 1999, 2000, 2001 (virada do milênio)\n- **REGRA CRÍTICA DE VALIDAÇÃO TEMPORAL**:\n  - Se a data do documento for MAIOR (ex: 19/12/2025) que a data de upload (${context.uploadDate.toLocaleDateString('pt-BR')}), marque como INVALID (data futura impossível)\n  - Se a data do documento for MENOR ou IGUAL (ex: 17/12/2025 ou ${context.uploadDate.toLocaleDateString('pt-BR')}), isso é VÁLIDO e ESPERADO\n  - **IMPORTANTE**: Estamos em ${context.uploadDate.getFullYear()}, portanto datas de 2024 e 2025 são PASSADO (válidas)\n  - Exemplo CORRETO: Upload 14/01/2026, Documento 01/07/25 (2025) = VALID (2025 é ANTES de 2026)\n  - Exemplo CORRETO: Upload 18/12/2025, Documento 17/12/2025 = VALID (documento é anterior)\n  - Exemplo CORRETO: Upload 18/12/2025, Documento 18/12/2025 = VALID (mesmo dia)\n  - Exemplo INCORRETO: Upload 18/12/2025, Documento 19/12/2025 = INVALID (documento é posterior)\n  - Exemplo INCORRETO: Upload 14/01/2026, Documento 15/03/2026 = INVALID (março de 2026 é FUTURO)\n- Atestados com mais de 12 meses (contando da data de upload) devem ser marcados como WARNING\n- Atestados com mais de 24 meses (contando da data de upload) devem ser marcados como INVALID (suspeita de reutilização)`
      : '';

    return `Você é um especialista em análise de documentos médicos brasileiros com foco em detecção de fraudes. Analise o atestado médico fornecido e forneça uma avaliação detalhada sobre sua autenticidade e validade.
${patientNameInstruction}${uploadDateInfo}

Avalie os seguintes aspectos:

1. **Nome do Paciente** (se contexto fornecido):
   - O nome no atestado corresponde ao nome esperado?
   - Há variações aceitáveis (abreviações, nome social, ordem diferente)?
   - Nomes completamente diferentes indicam possível fraude

2. **CRM (Registro Profissional) - Validação Visual/Formal**:
   - **IMPORTANTE**: Esta é uma validação VISUAL apenas, não consulta base de dados do CFM
   - O documento possui CRM visível e legível?
   - O formato do CRM está correto (CRM/UF XXXXXX ou apenas números)?
   - Está legível e não possui rasuras?
   - O CRM pode aparecer no carimbo, cabeçalho ou rodapé
   - Verifique se o número do CRM parece realista (não é "123456" ou sequências óbvias)
   - **LIMITAÇÃO**: Não valida se o CRM realmente existe ou está ativo no CFM

3. **Autenticidade Geral**:
   - O documento parece genuíno ou há sinais de adulteração digital?
   - Possui elementos de segurança típicos (papel timbrado, logo da clínica/hospital)?
   - Há rasuras, manchas suspeitas ou alterações visíveis?
   - A qualidade da impressão é consistente?
   - **ATENÇÃO**: Procure sinais de fotomontagem, textos sobrepostos, fontes inconsistentes
   - Bordas de texto mal recortadas ou sombras estranhas indicam edição digital
   - Resolução ou qualidade diferente entre partes do documento é suspeito

4. **Assinatura e Carimbo**:
   - IMPORTANTE: No Brasil, médicos podem usar ASSINATURA MANUSCRITA, CARIMBO, ou AMBOS
   - O documento possui pelo menos: assinatura manuscrita OU carimbo médico legível?
   - Se houver assinatura: parece natural (traço variável, pressão, fluidez)?
   - Se houver carimbo: está legível com CRM, nome do médico e especialidade?
   - **ATENÇÃO**: Carimbos digitais genéricos ou pixelados demais são suspeitos
   - Aceite como VÁLIDO se tiver carimbo legível MESMO SEM assinatura manuscrita
   - Aceite como VÁLIDO se tiver assinatura manuscrita MESMO SEM carimbo

5. **Data**:
   - O documento possui data visível e legível?
   - A data está no formato brasileiro correto (DD/MM/AAAA ou DD/MM/AA)?
   - **INTERPRETAÇÃO DE ANOS ABREVIADOS**: Se o ano tiver 2 dígitos (ex: 25, 24), interprete no contexto:
     * 24 = 2024, 25 = 2025, 26 = 2026 (anos recentes da década de 2020)
     * 99 = 1999, 00 = 2000, 01 = 2001 (apenas se contexto indicar)
   - **VALIDAÇÃO CRÍTICA DE COERÊNCIA TEMPORAL**: Compare CUIDADOSAMENTE a data DO DOCUMENTO com a data DE UPLOAD
   - **IMPORTANTE**: Data do documento ANTES (menor) da data de upload = VÁLIDO
   - **IMPORTANTE**: Data do documento IGUAL à data de upload = VÁLIDO
   - **IMPORTANTE**: Data do documento DEPOIS (maior) da data de upload = INVÁLIDO (impossível)
   - **EXEMPLOS PRÁTICOS COM ANO COMPLETO**:
     * Upload 14/01/2026, Documento 01/07/2025 → VALID (2025 é ANO PASSADO, antes de 2026)
     * Upload 14/01/2026, Documento 20/12/2025 → VALID (dezembro 2025 é antes de janeiro 2026)
     * Upload 18/12/2025, Documento 17/12/2025 → VALID (17 é ANTES de 18)
     * Upload 18/12/2025, Documento 18/12/2025 → VALID (mesmo dia)
     * Upload 18/12/2025, Documento 19/12/2025 → INVALID (19 é DEPOIS de 18, impossível)
   - **EXEMPLOS PRÁTICOS COM ANO ABREVIADO**:
     * Upload 14/01/2026, Documento 01/07/25 → VALID (25 = 2025, ano passado)
     * Upload 14/01/2026, Documento 15/03/24 → VALID (24 = 2024, 2 anos atrás)
     * Upload 14/01/2026, Documento 20/02/26 → INVALID (26 = 2026, fevereiro ainda não chegou)
   - Datas muito antigas (>2 anos antes do upload) são suspeitas de reutilização
   - Há sinais de alteração na data (sobrescrição, rasura, fonte diferente)?
   - **ATENÇÃO**: Datas alteradas digitalmente podem ter fonte ou tamanho inconsistente

6. **Período de Afastamento**:
   - O atestado especifica claramente o período de afastamento?
   - O período é razoável para um atestado médico (geralmente 1-15 dias)?
   - Períodos muito longos (>30 dias) sem justificativa podem ser suspeitos

7. **Legibilidade e Completude**:
   - O texto está legível e compreensível?
   - Todos os elementos essenciais estão presentes: nome do paciente, CID (opcional), período, data, assinatura/carimbo?
   - Não há partes cortadas ou borradas intencionalmente?
   - A qualidade permite leitura completa das informações críticas?

8. **Elementos de Clínica/Hospital**:
   - Possui cabeçalho com nome da clínica/consultório/hospital?
   - Há endereço, telefone ou CNPJ da instituição?
   - Logo ou identidade visual profissional?
   - **ATENÇÃO**: Falta total de identificação institucional é suspeita

Para cada aspecto, classifique como:
- **VALID**: Totalmente conforme e sem problemas
- **WARNING**: Possui irregularidade menor mas pode ser aceito com ressalvas
- **INVALID**: Possui problemas graves que invalidam o documento

CRITÉRIOS DE FRAUDE (marque INVALID se detectar):
- Nome do paciente completamente diferente do esperado
- CRM claramente falso (123456, sequências, formato errado)
- Sinais óbvios de edição digital (fontes diferentes, textos sobrepostos)
- **Data do documento POSTERIOR (MAIOR/DEPOIS) à data de upload:**
  * Upload 18/12/2025, Documento 19/12/2025 = INVALID
  * Upload 14/01/2026, Documento 20/02/2026 = INVALID (fevereiro 2026 é futuro)
- **ATENÇÃO - ESTAS DATAS SÃO VÁLIDAS (não marque como INVALID):**
  * Upload 14/01/2026, Documento 01/07/25 = VALID (25 = 2025, ano passado)
  * Upload 14/01/2026, Documento 20/12/2025 = VALID (dezembro 2025 é passado)
  * Upload 18/12/2025, Documento 17/12/2025 = VALID (dia anterior)
- Data muito antiga (>2 anos antes da data de upload)
- Ausência total de assinatura E carimbo
- Qualidade de imagem inconsistente (partes em resoluções diferentes)
- Elementos de texto mal recortados ou com bordas irregulares

Forneça sua resposta EXCLUSIVAMENTE no formato JSON abaixo (sem markdown, sem \`\`\`json, apenas o JSON puro):

{
  "isValid": true ou false (false se qualquer item for INVALID),
  "confidenceScore": número de 0 a 100 (confiança geral na análise),
  "conclusion": "texto resumindo a conclusão geral da análise",
  "crmValidation": "VALID" ou "WARNING" ou "INVALID",
  "crmObservation": "observações detalhadas sobre o CRM",
  "authenticityValidation": "VALID" ou "WARNING" ou "INVALID",
  "authenticityObservation": "observações sobre autenticidade, sinais de edição digital, elementos de segurança",
  "signatureValidation": "VALID" ou "WARNING" ou "INVALID",
  "signatureObservation": "observações sobre assinatura/carimbo",
  "dateValidation": "VALID" ou "WARNING" ou "INVALID",
  "dateObservation": "observações sobre a data, coerência temporal, sinais de alteração. LEMBRE-SE: data do documento ANTES/IGUAL à data de upload é VALID, DEPOIS é INVALID",
  "legibilityValidation": "VALID" ou "WARNING" ou "INVALID",
  "legibilityObservation": "observações sobre legibilidade, completude dos dados essenciais"
}

IMPORTANTE: Responda APENAS com o JSON, sem nenhum texto adicional antes ou depois.`;
  }

  private parseValidationResponse(responseText: string): ValidationResponse {
    try {
      // Remove possíveis marcadores de código markdown
      let cleanedText = responseText.trim();

      // Remove ```json ou ``` se existir
      cleanedText = cleanedText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '');

      const parsed = JSON.parse(cleanedText);

      return {
        isValid: parsed.isValid ?? false,
        confidenceScore: parsed.confidenceScore ?? 0,
        conclusion: parsed.conclusion ?? 'Análise inconclusiva',
        crmValidation: this.mapValidationResult(parsed.crmValidation),
        crmObservation: parsed.crmObservation ?? 'Não analisado',
        authenticityValidation: this.mapValidationResult(
          parsed.authenticityValidation,
        ),
        authenticityObservation:
          parsed.authenticityObservation ?? 'Não analisado',
        signatureValidation: this.mapValidationResult(
          parsed.signatureValidation,
        ),
        signatureObservation: parsed.signatureObservation ?? 'Não analisado',
        dateValidation: this.mapValidationResult(parsed.dateValidation),
        dateObservation: parsed.dateObservation ?? 'Não analisado',
        legibilityValidation: this.mapValidationResult(
          parsed.legibilityValidation,
        ),
        legibilityObservation: parsed.legibilityObservation ?? 'Não analisado',
      };
    } catch (error) {
      this.logger.error('Erro ao parsear resposta do Bedrock', error);
      this.logger.debug('Resposta recebida:', responseText);

      // Retorna resposta padrão em caso de erro de parsing
      return {
        isValid: false,
        confidenceScore: 0,
        conclusion: 'Erro ao processar análise da IA',
        crmValidation: ValidationResult.INVALID,
        crmObservation: 'Erro na análise',
        authenticityValidation: ValidationResult.INVALID,
        authenticityObservation: 'Erro na análise',
        signatureValidation: ValidationResult.INVALID,
        signatureObservation: 'Erro na análise',
        dateValidation: ValidationResult.INVALID,
        dateObservation: 'Erro na análise',
        legibilityValidation: ValidationResult.INVALID,
        legibilityObservation: 'Erro na análise',
      };
    }
  }

  private mapValidationResult(value: string): ValidationResult {
    const upperValue = (value || '').toUpperCase();

    switch (upperValue) {
      case 'VALID':
        return ValidationResult.VALID;
      case 'WARNING':
        return ValidationResult.WARNING;
      case 'INVALID':
        return ValidationResult.INVALID;
      default:
        return ValidationResult.INVALID;
    }
  }

  /**
   * Converte PDF para imagem JPEG usando pdftoppm
   */
  private async convertPdfToImage(pdfBuffer: Buffer): Promise<Buffer> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-'));
    const tempPdfPath = path.join(tempDir, 'temp.pdf');
    const outputPrefix = path.join(tempDir, 'output');

    try {
      // Salva PDF temporário
      await fs.writeFile(tempPdfPath, pdfBuffer);

      this.logger.debug(`Convertendo PDF: ${tempPdfPath}`);

      // Converte primeira página do PDF para JPEG (150 DPI)
      const { stdout, stderr } = await execAsync(
        `pdftoppm -jpeg -r 150 -f 1 -l 1 "${tempPdfPath}" "${outputPrefix}"`,
      );

      if (stderr) {
        this.logger.warn(`pdftoppm stderr: ${stderr}`);
      }
      if (stdout) {
        this.logger.debug(`pdftoppm stdout: ${stdout}`);
      }

      // Lê a imagem gerada (pdftoppm adiciona -1 ao nome)
      const imagePath = `${outputPrefix}-1.jpg`;

      // Verifica se o arquivo foi criado
      try {
        await fs.access(imagePath);
      } catch (error) {
        this.logger.error(`Arquivo de saída não encontrado: ${imagePath}`);
        throw new Error('Falha ao converter PDF para imagem');
      }

      const imageBuffer = await fs.readFile(imagePath);
      this.logger.debug(
        `PDF convertido com sucesso, tamanho da imagem: ${imageBuffer.length} bytes`,
      );

      return imageBuffer;
    } catch (error) {
      this.logger.error(`Erro ao converter PDF: ${error.message}`);
      throw new Error(`Falha na conversão do PDF: ${error.message}`);
    } finally {
      // Limpa arquivos temporários
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        this.logger.warn(
          `Erro ao limpar diretório temporário: ${cleanupError.message}`,
        );
      }
    }
  }

  private getImageMediaType(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'image/jpeg',
      'image/jpg': 'image/jpeg',
      'image/png': 'image/png',
      'image/gif': 'image/gif',
      'image/webp': 'image/webp',
    };

    return mimeMap[mimeType.toLowerCase()] || 'image/jpeg';
  }
}
