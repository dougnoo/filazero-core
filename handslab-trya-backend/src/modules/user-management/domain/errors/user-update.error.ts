import { DomainError } from './domain.error';

export class UserUpdateError extends DomainError {
  constructor(message: string = 'Erro ao atualizar usuário') {
    super(message);
  }
}
