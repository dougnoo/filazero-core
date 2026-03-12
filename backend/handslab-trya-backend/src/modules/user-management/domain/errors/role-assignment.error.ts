import { DomainError } from './domain.error';

export class RoleAssignmentError extends DomainError {
  constructor(message: string = 'Erro ao atribuir role ao usuário') {
    super(message);
  }
}
