export class InvalidOtpError extends Error {
  constructor(message: string = 'Código OTP inválido ou expirado') {
    super(message);
    this.name = 'InvalidOtpError';
  }
}
