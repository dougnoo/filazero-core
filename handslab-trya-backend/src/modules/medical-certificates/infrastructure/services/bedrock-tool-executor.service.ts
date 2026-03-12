import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  CFM_SITUACOES_MAP,
  CFM_SITUACOES_DETALHADAS_MAP,
  CFM_SITUATION_CLASSIFICATION,
  classificaSituacao,
  getDescricaoSituacao,
} from '../../../../shared/domain/constants/cfm-situations.constant';

/**
 * Serviço para executar Tool Use no Bedrock
 * Permite que o Claude chame ferramentas/APIs externas
 * 
 * Integrado com:
 * - TRYA Platform API (CFM)
 * - Constantes oficiais de situações de médicos
 */
@Injectable()
export class BedrockToolExecutorService {
  private readonly logger = new Logger(BedrockToolExecutorService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Definições das ferramentas disponíveis para o Claude usar
   * Corresponde à API real da TRYA Platform: POST /api/crm-validator/consult
   * Recebe: {crm: string, uf: string}
   */
  getToolDefinitions() {
    return [
      {
        name: 'validate_crm_online',
        description:
          'Valida um número de CRM em TEMPO REAL contra a base de dados do CFM via TRYA Platform API. Retorna dados completos do médico incluindo nome, especialidades e situação profissional.',
        input_schema: {
          type: 'object',
          properties: {
            crm_number: {
              type: 'string',
              description:
                'Número do CRM a validar (ex: "123456", "CRM/SP 123456", "CRM/RJ 654321", "123456 RJ"). Remove formatação automaticamente.',
            },
            state_code: {
              type: 'string',
              description:
                'Código UF em letras MAIÚSCULAS (ex: "SP", "RJ", "MG").',
            },
          },
          required: ['crm_number', 'state_code'],
        },
      },
    ];
  }

  /**
   * Executa uma ferramenta chamada pelo Claude
   */
  async executeTool(
    toolName: string,
    toolInput: Record<string, any>,
  ): Promise<string> {
    this.logger.log(
      `Executando ferramenta: ${toolName} com input: ${JSON.stringify(toolInput)}`,
    );

    try {
      if (toolName === 'validate_crm_online') {
        return JSON.stringify(
          await this.validateCRMOnline(
            toolInput.crm_number,
            toolInput.state_code,
          ),
        );
      }

      return JSON.stringify({
        success: false,
        error: `Ferramenta desconhecida: ${toolName}`,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao executar ${toolName}: ${errorMsg}`, error);
      return JSON.stringify({
        success: false,
        error: errorMsg,
      });
    }
  }

  /**
   * Valida CRM em tempo real contra a TRYA Platform API (integração com CFM)
   * API: https://platform-api.trya.ai/api/crm-validator/consult
   * 
   * Usa classificação oficial do CFM para determinar validade
   */
  private async validateCRMOnline(
    crmNumber: string,
    stateCode?: string,
  ): Promise<Record<string, any>> {
    try {
      const tryaPlatformUrl = this.configService.get<string>(
        'TRYA_PLATFORM_API_URL',
        'https://platform-api.trya.ai',
      );
      const tryaPlatformKey = this.configService.get<string>(
        'TRYA_PLATFORM_API_KEY',
      );
      const endpoint = '/api/crm-validator/consult';

      if (!tryaPlatformKey) {
        this.logger.warn(
          'TRYA_PLATFORM_API_KEY não configurada, retornando aviso',
        );
        return {
          success: true,
          isValid: false,
          crmNumber,
          message:
            'Validação online indisponível (API key não configurada)',
          shouldReviewManually: true,
        };
      }

      const crmOnlyNumber = crmNumber.replace(/\D/g, ''); // Remove formatação
      const uf = (stateCode || 'SP').toUpperCase(); // Default SP se não fornecido

      this.logger.log(
        `Consultando CRM ${crmOnlyNumber}/${uf} na TRYA Platform API`,
      );

      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${tryaPlatformUrl}${endpoint}`,
          {
            crm: crmOnlyNumber,
            uf: uf,
          },
          {
            timeout: 15000,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': tryaPlatformKey,
            },
          },
        ),
      );

      const data = response.data;

      // Classificar situação usando constantes oficiais CFM
      const situationKey = this.findSituationKey(
        data.situationDescription,
      );
      const classification = situationKey
        ? CFM_SITUATION_CLASSIFICATION[situationKey]
        : 'INVALID';

      // Mapear resposta da TRYA Platform com dados officiiais
      const result = {
        success: true,
        isValid: data.isValid === true && classification === 'VALID', // Valid se isValid AND situação é Regular
        validationStatus: classification, // VALID | WARNING | INVALID
        crmNumber: data.crm || crmNumber,
        uf: data.uf || uf,
        doctorName: data.name || null,
        registrationType: data.registrationTypeDescription || null,
        specialties: data.specialties || [],
        operationCode: data.operationCode || null,
        error: data.error || null,

        // Situação (código)
        situationCode: situationKey || null,
        situationShort: data.situationDescription
          ? (this.findSituationKey(data.situationDescription) &&
              CFM_SITUACOES_MAP[
                this.findSituationKey(data.situationDescription)!
              ]) ||
            data.situationDescription
          : null,

        // Situação (descrição detalhada oficial)
        situationDetailed: situationKey
          ? CFM_SITUACOES_DETALHADAS_MAP[situationKey]
          : data.situationDetailedDescription || null,

        message: this.getValidationMessage(data),
      };

      this.logger.log(
        `CRM ${crmOnlyNumber}/${uf} validado: ${classification}`,
      );

      return result;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;

      this.logger.warn(
        `Falha ao consultar CRM na TRYA Platform: ${errorMsg}`,
      );

      // Retorna aviso sem falhar completamente
      return {
        success: true,
        isValid: false,
        validationStatus: 'INVALID',
        crmNumber: crmNumber.replace(/\D/g, ''),
        message: `Não foi possível validar CRM online: ${errorMsg}`,
        shouldReviewManually: true,
        error: errorMsg,
      };
    }
  }

  /**
   * Gera mensagem legível baseada na resposta da TRYA Platform
   * Usa constantes oficiais do CFM
   */
  private getValidationMessage(data: any): string {
    const crmNumber = data.crm || 'N/A';
    const uf = data.uf || 'SP';
    const doctorName = data.name || '';
    const situation = data.situationDescription || '';

    // Se não achou o médico
    if (data.operationCode === 8101 || !data.isValid) {
      return `CRM ${crmNumber}/${uf} não encontrado na base de dados do CFM - ${data.error || 'Possível fraude'}`;
    }

    // Se achou, mapeia situação oficial
    const situationKey = this.findSituationKey(situation);
    const classification = situationKey
      ? CFM_SITUATION_CLASSIFICATION[situationKey]
      : 'INVALID';
    const descricaoDetalhada = situationKey
      ? CFM_SITUACOES_DETALHADAS_MAP[situationKey]
      : data.situationDetailedDescription;

    // Monta mensagem baseada na classificação
    const baseMsg = `CRM ${crmNumber}/${uf} - ${doctorName}`;

    switch (classification) {
      case 'VALID':
        return `${baseMsg} ✅ VÁLIDO\nSituação: ${situation}\n${descricaoDetalhada}`;

      case 'WARNING':
        return `${baseMsg} ⚠️ COM RESSALVA\nSituação: ${situation}\n${descricaoDetalhada}\n⚠️ REQUER REVISÃO MANUAL`;

      case 'INVALID':
        return `${baseMsg} ❌ INVÁLIDO\nSituação: ${situation}\n${descricaoDetalhada}\n❌ NÃO PODE EXERCER A MEDICINA`;

      default:
        return `${baseMsg}\nSituação: ${situation}`;
    }
  }

  /**
   * Encontra a chave de situação (A, B, C, etc.) baseado na descrição
   */
  private findSituationKey(
    situationDescription?: string,
  ): keyof typeof CFM_SITUACOES_MAP | null {
    if (!situationDescription) return null;

    // Tenta match exato no mapa curto
    const matched = Object.keys(CFM_SITUACOES_MAP).find(
      (key) =>
        CFM_SITUACOES_MAP[key as keyof typeof CFM_SITUACOES_MAP].toLowerCase() ===
        situationDescription.toLowerCase(),
    );

    if (matched) return matched as keyof typeof CFM_SITUACOES_MAP;

    // Tenta match parcial/fuzzy
    const descLower = situationDescription.toLowerCase();
    return (
      (Object.keys(CFM_SITUACOES_MAP).find((key) => {
        const shortDesc =
          CFM_SITUACOES_MAP[key as keyof typeof CFM_SITUACOES_MAP].toLowerCase();
        return shortDesc.includes(descLower) || descLower.includes(shortDesc);
      }) as keyof typeof CFM_SITUACOES_MAP) || null
    );
  }

  /**
   * Verifica se um médico está registrado com aquele CRM na TRYA Platform
   * Usa a mesma API de validação CRM
   */
  private async checkDoctorRegistration(
    crmNumber: string,
    doctorName: string,
    specialty?: string,
  ): Promise<Record<string, any>> {
    try {
      // Reutiliza a validação de CRM para obter dados do médico
      const crmValidation = await this.validateCRMOnline(
        crmNumber,
        undefined,
      );

      if (!crmValidation.success) {
        return {
          found: false,
          doctorName,
          crmNumber,
          message: 'Não foi possível validar CRM',
          shouldReviewManually: true,
        };
      }

      const crmIsValid = crmValidation.validationStatus === 'VALID';
      const registeredName = crmValidation.doctorName;
      const registeredSpecialties = crmValidation.specialties || [];
      const situation = crmValidation.situationShort;
      const situationDetailed = crmValidation.situationDetailed;

      // Comparar nome do atestado com nome registrado (com tolerância)
      const nameMatch =
        registeredName &&
        this.compareNames(doctorName, registeredName);

      return {
        success: true,
        found: crmIsValid,
        doctorName,
        registeredName: registeredName || null,
        crmNumber: crmValidation.crmNumber,
        nameMatches: nameMatch,
        specialties: registeredSpecialties,
        situation,
        situationDetailed,
        validationStatus: crmValidation.validationStatus,
        message: this.getDoctorValidationMessage(
          crmIsValid,
          nameMatch,
          registeredName,
          situation,
          situationDetailed,
        ),
      };
    } catch (error: any) {
      return {
        success: true,
        found: false,
        doctorName,
        crmNumber,
        message: `Médico não validado: ${error.message}`,
        shouldReviewManually: true,
      };
    }
  }

  /**
   * Compara nomes com tolerância para variações
   */
  private compareNames(name1: string, name2: string): boolean {
    if (!name1 || !name2) return false;

    // Normaliza: minúsculas, remove acentos, remove espaços extras
    const normalize = (n: string) =>
      n
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const n1 = normalize(name1);
    const n2 = normalize(name2);

    // Igualdade exata
    if (n1 === n2) return true;

    // Verifica se um está contido no outro (tolerância para nomes incompletos)
    const parts1 = n1.split(' ');
    const parts2 = n2.split(' ');

    // Se tem pelo menos 2 partes em comum (sobrenome + uma parte do nome)
    const commonParts = parts1.filter((p) => parts2.includes(p));
    return commonParts.length >= 2;
  }

  /**
   * Gera mensagem de validação do médico
   */
  private getDoctorValidationMessage(
    crmValid: boolean,
    nameMatches: boolean,
    registeredName: string | null,
    situation: string | null,
    situationDetailed?: string | null,
  ): string {
    if (!crmValid) {
      return 'CRM não encontrado no registro do CFM';
    }

    if (!nameMatches) {
      return `Nome mismatch: Atestado vs Registro (${registeredName})`;
    }

    if (situation && situation !== 'Regular') {
      return `Médico com situação: ${situation}\n${situationDetailed || ''}`;
    }

    return `Médico validado: ${registeredName}`;
  }
}
