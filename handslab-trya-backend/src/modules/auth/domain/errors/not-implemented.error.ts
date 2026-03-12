import { DomainError } from './domain.error';

export class NotImplementedError extends DomainError {
  constructor(message: string = 'Funcionalidade não implementada') {
    super(message);
  }
}
