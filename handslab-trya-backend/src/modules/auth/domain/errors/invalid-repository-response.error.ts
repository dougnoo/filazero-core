import { DomainError } from './domain.error';

export class InvalidRepositoryResponseError extends DomainError {
  constructor(message: string = 'Resposta inválida do repositório') {
    super(message);
  }
}
