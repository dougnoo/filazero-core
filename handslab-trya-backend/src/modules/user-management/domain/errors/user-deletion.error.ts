import { DomainError } from './domain.error';

export class UserDeletionError extends DomainError {
  constructor(message: string = 'Erro ao deletar usuário') {
    super(message);
  }
}
