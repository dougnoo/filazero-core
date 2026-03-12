/**
 * DTOs de resposta da API CRM Validator
 * Baseados na especificação oficial do CFM
 */

/**
 * Resposta de validação de médico
 * Conforme seção 3.1 da especificação CFM
 */
export class ValidarMedicoResponseDto {
  /**
   * Indica se o médico existe e está válido na base do CFM
   * True = cadastro válido (médico encontrado)
   * False = cadastro inválido (médico não encontrado)
   */
  isValid: boolean;

  /**
   * CRM do médico (até 7 dígitos)
   */
  crm: string;

  /**
   * UF onde o CRM foi emitido (2 caracteres)
   */
  uf: string;

  /**
   * Código de operação (0 = sucesso, outro = erro com código CFM)
   */
  operationCode: number;

  /**
   * Mensagem de erro (se houver)
   */
  error?: string;
}

/**
 * Resposta de consulta de dados do médico
 * Conforme seção 3.1 da especificação CFM
 */
export class ConsultarMedicoResponseDto {
  /**
   * Indica se os dados foram encontrados
   */
  isValid: boolean;

  /**
   * CRM do médico (até 7 dígitos)
   * Tamanho máximo: 7 caracteres
   * Tipo: inteiro
   */
  crm: string;

  /**
   * UF onde o CRM foi emitido (2 caracteres)
   * Tipo: texto
   * Tamanho: 2
   */
  uf: string;

  /**
   * Nome do médico (até 70 caracteres)
   * Tipo: texto
   * Tamanho máximo: 70
   */
  name: string;

  /**
   * Situação do médico
   * Código de 1 caractere conforme tabela:
   * A = Regular
   * B = Suspensão parcial permanente
   * C = Cassado
   * E = Inoperante
   * F = Falecido
   * G = Sem o exercício da profissão na UF
   * I = Interdição cautelar - total
   * J = Suspenso por ordem judicial - parcial
   * L = Cancelado
   * M = Suspensão total temporária
   * N = Interdição cautelar - parcial
   * O = Suspenso por ordem judicial - total
   * P = Aposentado
   * R = Suspensão temporária
   * S = Suspenso - total
   * T = Transferido
   * X = Suspenso - parcial
   */
  situation?: string;

  /**
   * Descrição resumida da situação do médico
   */
  situationDescription: string;

  /**
   * Descrição completa da situação do médico conforme CFM
   */
  situationDetailedDescription: string;

  /**
   * Tipo de inscrição do médico
   * Código de 1 caractere:
   * P = Principal
   * S = Secundária
   * V = Provisória
   * T = Temporária
   * E = Estudando Médico Estrangeiro
   */
  registrationType?: string;

  /**
   * Descrição do tipo de inscrição
   */
  registrationTypeDescription: string;

  /**
   * Data da última atualização dos dados
   * Formato: DD/MM/YYYY
   * Sem máscara (apenas dígitos no WSDL)
   */
  updateDate?: string;

  /**
   * Lista de especialidades do médico
   * Array de strings, tamanho variável
   */
  specialties: string[];

  /**
   * CPF do médico (11 dígitos)
   * Tipo: texto
   * Tamanho: 11
   */
  cpf?: string;

  /**
   * Código de operação (0 = sucesso, outro = erro com código CFM)
   * Descrição na tabela de códigos da seção 2.2
   */
  operationCode: number;

  /**
   * Mensagem de erro (se houver)
   */
  error?: string;
}

/**
 * Mapeamento de situações de médicos conforme especificação CFM (resumido)
 */
export const CFM_SITUACOES_MAP: Record<string, string> = {
  A: 'Regular',
  B: 'Suspensão parcial permanente',
  C: 'Cassado',
  E: 'Inoperante',
  F: 'Falecido',
  G: 'Sem o exercício da profissão na UF',
  I: 'Interdição cautelar - total',
  J: 'Suspenso por ordem judicial - parcial',
  L: 'Cancelado',
  M: 'Suspensão total temporária',
  N: 'Interdição cautelar - parcial',
  O: 'Suspenso por ordem judicial - total',
  P: 'Aposentado',
  R: 'Suspensão temporária',
  S: 'Suspenso - total',
  T: 'Transferido',
  X: 'Suspenso - parcial',
};

/**
 * Mapeamento detalhado de situações de médicos conforme especificação oficial CFM
 */
export const CFM_SITUACOES_DETALHADAS_MAP: Record<string, string> = {
  A: 'Médico que está regularmente inscrito no Conselho Regional de Medicina e se encontra apto ao exercício da medicina.',
  B: 'Médico suspenso parcialmente de exercer determinada atividade médica por decisão administrativa do Conselho de Medicina em decorrência de doença incapacitante.',
  C: 'Médico apenado com cassação do exercício trabalhista em decorrência de processo ético-profissional (artigo 22, letra "e" da Lei 3.238/57) e, com sentença judicial transitada em julgado.',
  E: 'Médico que não recolhe anuidades há mais de cinco anos ou com paradeiro desconhecido.',
  F: 'Médico falecido.',
  G: 'Sem o exercício da profissão na UF.',
  I: 'Médico interditado para o exercício trabalhista por decisão administrativa do Conselho Regional/Federal de Medicina.',
  J: 'Médico suspenso parcialmente de exercer determinada atividade médica em decorrência de decisão judicial.',
  L: 'Médico que teve sua inscrição cancelada por não apresentar diploma médico no CRM no prazo de 120 dias ou a pedido próprio, em decorrência de viagem ao exterior ou encerramento da atividade profissional.',
  M: 'Médico suspenso do exercício da medicina por decisão administrativa do Conselho de Medicina em decorrência de doença incapacitante.',
  N: 'Médico interditado parcialmente de exercer determinada atividade médica em decorrência de decisão administrativa do Conselho Regional de Medicina.',
  O: 'Médico suspenso do exercício da medicina em decorrência de decisão judicial.',
  P: 'Médico com inscrição cancelada por aposentadoria.',
  R: 'Médico suspenso por tempo determinado, de até trinta dias, do exercício da medicina por ter sido apenado em processo ético-profissional (artigo 22, letra "d" da Lei 3.268/57).',
  S: 'Médico suspenso do exercício da medicina por decisão administrativa do Conselho de Medicina em decorrência de doença incapacitante.',
  T: 'Médico que solicitou transferência de Conselho Regional de Medicina (CRM) de seu estado de origem para outros estados.',
  X: 'Médico suspenso parcialmente de exercer determinada atividade médica por decisão administrativa do Conselho de Medicina em decorrência de doença incapacitante.',
};

/**
 * Mapeamento de tipos de inscrição conforme especificação CFM
 */
export const CFM_TIPO_INSCRICAO_MAP: Record<string, string> = {
  P: 'Principal',
  S: 'Secundária',
  V: 'Provisória',
  T: 'Temporária',
  E: 'Estudando Médico Estrangeiro',
};

/**
 * Mapeamento de códigos de erro do CFM conforme seção 2.2 da especificação
 */
export const CFM_ERRO_CODES_MAP: Record<number, string> = {
  1010: 'Erro de inicialização do driver de conexão MYSQL',
  1020: 'Erro de inicialização do driver de conexão ORACLE',
  1030: 'Erro ao tentar estabelecer conexão com o banco de dados MYSQL',
  1040: 'Erro ao tentar estabelecer conexão com o banco de dados ORACLE',
  1050: 'Erro ao tentar fechar a conexão com o banco de dados MYSQL',
  1060: 'Erro ao tentar fechar a conexão com o banco de dados ORACLE',
  2010: 'Erro ao realizar a validação da chave de identificação',
  2020: 'Erro ao tentar identificar o convênio do órgão com o CFM',
  2030: 'Erro ao gravar o registro de log de acesso',
  2040: 'Erro ao consultar dados de um médico',
  3010: 'A chave de acesso informada é inválida',
  4000: 'O parâmetro UF não foi informado',
  4010: 'O parâmetro número do CRM não foi informado (igual a 0)',
  4020: 'A chave de identificação não foi informada',
  4030: 'O número do CPF não foi informado',
  4040: 'A Data de nascimento não foi informada',
  8101: 'Médico não encontrado',
};
