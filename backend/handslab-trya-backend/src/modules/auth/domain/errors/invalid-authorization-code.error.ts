import { DomainError } from './domain.error';

export class InvalidAuthorizationCodeError extends DomainError {
  constructor(
    message: string = 'Código de autorização inválido ou não fornecido',
  ) {
    super(message);
  }
}
