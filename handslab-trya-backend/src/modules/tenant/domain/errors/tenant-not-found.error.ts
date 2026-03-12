import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class TenantNotFoundError extends DomainError {
  constructor(message: string = 'Empresa não encontrada') {
    super(message);
  }
}
