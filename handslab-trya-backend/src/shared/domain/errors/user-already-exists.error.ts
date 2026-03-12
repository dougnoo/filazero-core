import { DomainError } from './domain.error';

export class UserAlreadyExistsError extends DomainError {
  constructor(message: string = 'Usuário com este email já existe') {
    super(message);
  }
}
