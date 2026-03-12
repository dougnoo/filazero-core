export class UserNotConfirmedError extends Error {
  constructor(message: string = 'Email do usuário não confirmado') {
    super(message);
    this.name = 'UserNotConfirmedError';
  }
}
