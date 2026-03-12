import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class TenantAlreadyExistsError extends DomainError {
  constructor(message: string = 'Empresa já cadastrada no sistema') {
    super(message);
  }
}
