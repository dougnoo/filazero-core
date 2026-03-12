export class ForgotPasswordError extends Error {
  constructor(message: string = 'Erro ao solicitar redefinição de senha') {
    super(message);
    this.name = 'ForgotPasswordError';
  }
}
