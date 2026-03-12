/**
 * Erro lançado quando há falha na conexão com o web service do CFM
 */
export class CfmConnectionError extends Error {
  constructor(message: string = 'Falha ao conectar ao web service do CFM') {
    super(message);
    this.name = 'CfmConnectionError';
  }
}

/**
 * Erro lançado quando parâmetros inválidos são fornecidos
 */
export class InvalidCrmParametersError extends Error {
  constructor(message: string = 'Parâmetros inválidos para validação de CRM') {
    super(message);
    this.name = 'InvalidCrmParametersError';
  }
}

/**
 * Erro lançado quando a chave de identificação é inválida
 */
export class InvalidCfmKeyError extends Error {
  constructor(message: string = 'Chave de identificação do CFM inválida') {
    super(message);
    this.name = 'InvalidCfmKeyError';
  }
}

/**
 * Erro lançado quando há erro na resposta do CFM
 */
export class CfmServiceError extends Error {
  constructor(
    public readonly codigoErro: number,
    message: string = 'Erro ao processar requisição no CFM',
  ) {
    super(message);
    this.name = 'CfmServiceError';
  }
}
