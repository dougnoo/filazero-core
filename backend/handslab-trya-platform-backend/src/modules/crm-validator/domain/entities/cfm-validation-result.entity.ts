/**
 * Resultado da validação de CRM contra o web service do CFM
 */
export interface CfmValidationResult {
  isValid: boolean;
  crm: string;
  uf: string;
  cpf?: string;
  nome?: string;
  situacao?: string;
  especialidades?: string[];
  dataAtualizacao?: string;
  tipoInscricao?: string;
  codigoOperacao?: number;
  erro?: string;
}

/**
 * Resposta de consulta de médico do CFM
 */
export interface CfmConsultaResponse extends CfmValidationResult {
  nome: string;
  situacao: string;
  especialidades: string[];
  dataAtualizacao: string;
  tipoInscricao: string;
}
