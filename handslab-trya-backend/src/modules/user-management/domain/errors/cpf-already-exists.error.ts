import { DomainError } from './domain.error';

export class CpfAlreadyExistsError extends DomainError {
  constructor(message: string = 'CPF já cadastrado no sistema') {
    super(message);
  }
}
