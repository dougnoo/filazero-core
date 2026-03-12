export class ResetPasswordError extends Error {
  constructor(message: string = 'Erro ao redefinir senha') {
    super(message);
    this.name = 'ResetPasswordError';
  }
}
