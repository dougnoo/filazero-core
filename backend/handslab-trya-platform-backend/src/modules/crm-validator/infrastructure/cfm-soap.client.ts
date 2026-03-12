import { Logger, Injectable } from '@nestjs/common';
import * as soap from 'soap';
import {
  ICfmClient,
  IConsultarMedicoRequest,
  IValidarMedicoRequest,
} from '../domain/interfaces/cfm-client.interface';
import {
  CfmConsultaResponse,
  CfmValidationResult,
} from '../domain/entities/cfm-validation-result.entity';
import {
  CfmConnectionError,
  CfmServiceError,
  InvalidCfmKeyError,
  InvalidCrmParametersError,
} from '../domain/errors/cfm-errors';
import { CFM_ERRO_CODES_MAP } from '../presentation/dtos/cfm-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CfmSoapClient implements ICfmClient {
  private readonly logger = new Logger(CfmSoapClient.name);
  private soapClient: any;
  private readonly cfmUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.cfmUrl =
      this.configService.get<string>('cfm.url') || process.env.CFM_URL || '';
    if (!this.cfmUrl) {
      throw new CfmConnectionError(
        'URL do CFM não configurada. Configure a variável de ambiente CFM_URL',
      );
    }
    this.logger.log(`CFM Client configurado para ${this.cfmUrl}`);

    this.apiKey =
      this.configService.get<string>('cfm.apiKey') ||
      process.env.CFM_API_KEY ||
      '';
    if (!this.apiKey) {
      throw new InvalidCfmKeyError(
        'Chave de identificação não configurada. Configure a variável de ambiente CFM_API_KEY',
      );
    }
  }

  /**
   * Inicializa o cliente SOAP
   */
  private async initializeSoapClient(): Promise<void> {
    if (this.soapClient) return;

    try {
      this.soapClient = await soap.createClientAsync(this.cfmUrl);

      this.logger.log('Cliente SOAP CFM inicializado com sucesso');
    } catch (error) {
      this.logger.error(
        `Erro ao conectar ao CFM: ${error.message}`,
        error.stack,
      );
      throw new CfmConnectionError(
        `Falha ao conectar ao web service do CFM: ${error.message}`,
      );
    }
  }

  async validarMedico(
    dto: IValidarMedicoRequest,
  ): Promise<CfmValidationResult> {
    try {
      this.validateParameters(dto);
      await this.initializeSoapClient();

      const resultado = await this.callSoapMethod('Validar', {
        crm: parseInt(dto.crm, 10),
        uf: dto.uf,
        cpf: dto.cpf,
        dataNascimento: dto.dataNascimento,
      });

      return this.parseValidacaoResponse(resultado, dto);
    } catch (error) {
      this.logger.error(
        `Erro ao validar médico: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof
        (CfmConnectionError || InvalidCfmKeyError || CfmServiceError)
      ) {
        throw error;
      }

      throw new CfmServiceError(0, `Erro ao validar médico: ${error.message}`);
    }
  }

  async consultarMedico(
    dto: IConsultarMedicoRequest,
  ): Promise<CfmConsultaResponse> {
    try {
      this.validateConsultaParameters(dto);
      await this.initializeSoapClient();

      const resultado = await this.callSoapMethod('Consultar', {
        crm: parseInt(dto.crm, 10),
        uf: dto.uf,
        chave: this.apiKey,
      });

      return this.parseConsultaResponse(resultado, dto);
    } catch (error) {
      this.logger.error(
        `Erro ao consultar médico: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof
        (CfmConnectionError || InvalidCfmKeyError || CfmServiceError)
      ) {
        throw error;
      }

      throw new CfmServiceError(
        0,
        `Erro ao consultar médico: ${error.message}`,
      );
    }
  }

  /**
   * Chama um método SOAP
   * Os métodos SOAP estão no nível raiz do cliente: Consultar, Validar, ConsultaCompleta, buscarImagem
   */
  private callSoapMethod(methodName: string, args: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const operation = this.soapClient[methodName];

        if (!operation || typeof operation !== 'function') {
          throw new Error(
            `Método '${methodName}' não encontrado no cliente SOAP. ` +
              `Métodos disponíveis: Consultar, Validar, ConsultaCompleta, buscarImagem`,
          );
        }

        // Chamar a operação SOAP
        operation(args, (err: Error | null, result: any) => {
          if (err) {
            this.logger.error(
              `Erro ao chamar '${methodName}': ${err.message}`,
              err.stack,
            );
            reject(err);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Valida parâmetros para validação
   */
  private validateParameters(dto: IValidarMedicoRequest): void {
    if (!dto.crm || dto.crm === '0') {
      throw new InvalidCrmParametersError(
        'O número do CRM é obrigatório e não pode ser 0',
      );
    }
    if (!dto.uf || dto.uf.length !== 2) {
      throw new InvalidCrmParametersError(
        'A UF é obrigatória e deve ter 2 caracteres',
      );
    }
    if (!dto.cpf || dto.cpf.length !== 11) {
      throw new InvalidCrmParametersError(
        'O CPF é obrigatório e deve ter 11 dígitos',
      );
    }
    if (!dto.dataNascimento) {
      throw new InvalidCrmParametersError(
        'A data de nascimento é obrigatória (DD/MM/YYYY)',
      );
    }
  } /**
   * Valida parâmetros para consulta
   */
  private validateConsultaParameters(dto: IConsultarMedicoRequest): void {
    if (!dto.crm || dto.crm === '0') {
      throw new InvalidCrmParametersError(
        'O número do CRM é obrigatório e não pode ser 0',
      );
    }
    if (!dto.uf || dto.uf.length !== 2) {
      throw new InvalidCrmParametersError(
        'A UF é obrigatória e deve ter 2 caracteres',
      );
    }
  }

  /**
   * Processa resposta de validação do CFM
   * Operação Validar retorna: resultadoConsulta (xs:boolean)
   */
  private parseValidacaoResponse(
    resultado: any,
    dto: IValidarMedicoRequest,
  ): CfmValidationResult {
    // A resposta é um objeto com resultadoConsulta: boolean
    const isValid = resultado?.resultadoConsulta === true || resultado === true;

    if (isValid) {
      return {
        isValid: true,
        crm: dto.crm,
        uf: dto.uf,
        codigoOperacao: 0,
      };
    } else {
      return {
        isValid: false,
        crm: dto.crm,
        uf: dto.uf,
        codigoOperacao: 8101,
        erro: 'Médico não encontrado',
      };
    }
  }

  /**
   * Processa resposta de consulta do CFM
   * Operação Consultar retorna: dadosMedico contendo nome, crm, uf, cpf, situacao, especialidades, etc
   */
  private parseConsultaResponse(
    resultado: any,
    dto: IConsultarMedicoRequest,
  ): CfmConsultaResponse {
    // A resposta do WSDL para Consultar retorna um objeto com dadosMedico
    const dadosMedico = resultado?.dadosMedico || resultado;

    // Se houver código de erro
    if (
      dadosMedico?.codigoErro &&
      dadosMedico.codigoErro !== '0' &&
      dadosMedico.codigoErro !== 0
    ) {
      const errorCode = parseInt(dadosMedico.codigoErro, 10);
      const errorMessage = CFM_ERRO_CODES_MAP[errorCode] || 'Erro desconhecido';

      // Código 8101 significa médico não encontrado
      if (errorCode === 8101) {
        return {
          isValid: false,
          crm: dto.crm,
          uf: dto.uf,
          codigoOperacao: errorCode,
          erro: errorMessage,
          nome: '',
          situacao: '',
          especialidades: [],
          dataAtualizacao: '',
          tipoInscricao: '',
        };
      }

      throw new CfmServiceError(errorCode, errorMessage);
    }

    // Se não houver dados, o médico não foi encontrado
    if (!dadosMedico || !dadosMedico.nome) {
      return {
        isValid: false,
        crm: dto.crm,
        uf: dto.uf,
        codigoOperacao: 8101,
        erro: 'Médico não encontrado',
        nome: '',
        situacao: '',
        especialidades: [],
        dataAtualizacao: '',
        tipoInscricao: '',
      };
    }

    // Processar especialidades (podem vir como array ou string no WSDL como especialidade[])
    let especialidades: string[] = [];
    if (dadosMedico['especialidade[]']) {
      especialidades = Array.isArray(dadosMedico['especialidade[]'])
        ? dadosMedico['especialidade[]']
        : [dadosMedico['especialidade[]']];
    } else if (dadosMedico.especialidades) {
      especialidades = Array.isArray(dadosMedico.especialidades)
        ? dadosMedico.especialidades
        : [dadosMedico.especialidades];
    }

    // Extrair código da situação (1 caractere: A, B, C, etc.)
    const situacaoRaw = dadosMedico.situacao || '';
    const situacaoCode =
      situacaoRaw.length === 1 ? situacaoRaw : situacaoRaw[0] || '';

    // Extrair código do tipo de inscrição (1 caractere: P, S, V, T, E)
    const tipoInscricaoRaw = dadosMedico.tipoInscricao || '';
    const tipoInscricaoCode =
      tipoInscricaoRaw.length === 1
        ? tipoInscricaoRaw
        : tipoInscricaoRaw[0] || '';

    // Determinar isValid: apenas "A" (Regular) é válido
    const isValid = situacaoCode === 'A';

    return {
      isValid,
      crm: dadosMedico.crm || dto.crm,
      uf: dadosMedico.uf || dto.uf,
      cpf: dadosMedico.numeroCPF || '',
      nome: dadosMedico.nome,
      situacao: situacaoCode,
      especialidades,
      dataAtualizacao: dadosMedico.dataAtualizacao || '',
      tipoInscricao: tipoInscricaoCode,
      codigoOperacao: 0,
    };
  }
}
