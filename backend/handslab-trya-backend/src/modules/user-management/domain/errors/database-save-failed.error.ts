import { DomainError } from './domain.error';

export class DatabaseSaveFailedError extends DomainError {
  constructor(message: string = 'Falha ao salvar dados no banco de dados') {
    super(message);
  }
}
