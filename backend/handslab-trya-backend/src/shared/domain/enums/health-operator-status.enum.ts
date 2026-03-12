export enum HealthOperatorStatus {
  /**
   * Operadora recém-cadastrada, ainda sem rede credenciada importada.
   */
  CADASTRADA = 'CADASTRADA',

  /**
   * Operadora com rede credenciada importada e disponível para uso.
   */
  REDE_CREDENCIADA_DISPONIVEL = 'REDE_CREDENCIADA_DISPONIVEL',
}
