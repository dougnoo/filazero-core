export class InvalidTokenStepError extends Error {
  constructor(message: string = 'Token inválido para esta etapa') {
    super(message);
    this.name = 'InvalidTokenStepError';
  }
}
