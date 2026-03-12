export class InvalidVerificationCodeError extends Error {
  constructor(message: string = 'Código de verificação inválido') {
    super(message);
    this.name = 'InvalidVerificationCodeError';
  }
}
