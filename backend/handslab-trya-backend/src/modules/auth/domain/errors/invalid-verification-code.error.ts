export class InvalidVerificationCodeError extends Error {
  constructor(message: string = 'Código de verificação inválido ou expirado') {
    super(message);
    this.name = 'InvalidVerificationCodeError';
  }
}
