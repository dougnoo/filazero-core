import { DomainError } from './domain.error';

export class UserNotConfirmedError extends DomainError {
  constructor(message: string = 'Usuário não confirmou o email') {
    super(message);
  }
}
