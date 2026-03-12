export class CodeExpiredError extends Error {
  constructor(message: string = 'Código de verificação expirado') {
    super(message);
    this.name = 'CodeExpiredError';
  }
}
