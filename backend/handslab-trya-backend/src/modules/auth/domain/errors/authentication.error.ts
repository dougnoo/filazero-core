import { DomainError } from './domain.error';

export class AuthenticationError extends DomainError {
  constructor(message: string = 'Erro de autenticação') {
    super(message);
  }
}
