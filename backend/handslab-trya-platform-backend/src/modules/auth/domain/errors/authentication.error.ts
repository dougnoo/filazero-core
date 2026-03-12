export class AuthenticationError extends Error {
  constructor(message: string = 'Falha na autenticação') {
    super(message);
    this.name = 'AuthenticationError';
  }
}
