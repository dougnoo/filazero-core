import { DomainError } from './domain.error';

export class UserCreationError extends DomainError {
  constructor(message: string = 'Erro ao criar usuário') {
    super(message);
  }
}
