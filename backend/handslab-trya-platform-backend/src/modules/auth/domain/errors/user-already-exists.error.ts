export class UserAlreadyExistsError extends Error {
  constructor(message: string = 'Usuário já existe') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}
