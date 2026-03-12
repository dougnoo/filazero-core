import { DomainError } from './domain.error';

export class TenantMismatchError extends DomainError {
  constructor(message: string = 'Usuário não pertence ao tenant especificado') {
    super(message);
  }
}
