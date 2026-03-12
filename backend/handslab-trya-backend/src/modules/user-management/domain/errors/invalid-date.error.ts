import { DomainError } from './domain.error';

export class InvalidDateError extends DomainError {
  constructor(message: string = 'Data de nascimento é obrigatória') {
    super(message);
    this.name = 'InvalidDateError';
  }
}
