import { CfmValidationResult, CfmConsultaResponse } from '../entities/cfm-validation-result.entity';

/**
 * Interface para cliente de validação de CRM
 * Será implementada pela camada de infra usando SOAP
 */
export interface ICfmClient {
  /**
   * Valida os dados de um médico no CFM
   * @param dto Dados para validação (CRM, UF, CPF, data de nascimento)
   * @returns Resultado da validação
   */
  validarMedico(dto: IValidarMedicoRequest): Promise<CfmValidationResult>;

  /**
   * Consulta dados de um médico no CFM
   * @param dto Dados para consulta (CRM, UF)
   * @returns Dados do médico
   */
  consultarMedico(dto: IConsultarMedicoRequest): Promise<CfmConsultaResponse>;
}

/**
 * DTO para validação de médico
 */
export interface IValidarMedicoRequest {
  crm: string;
  uf: string;
  cpf: string;
  dataNascimento: string; // DD/MM/YYYY
  chave: string;
}

/**
 * DTO para consulta de médico
 */
export interface IConsultarMedicoRequest {
  crm: string;
  uf: string;
  chave: string;
}

export const CFM_CLIENT_TOKEN = 'ICfmClient';
