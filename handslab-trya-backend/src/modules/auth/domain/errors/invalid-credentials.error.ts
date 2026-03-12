import { DomainError } from './domain.error';

export class InvalidCredentialsError extends DomainError {
  constructor(message: string = 'Email ou senha inválidos') {
    super(message);
  }
}
