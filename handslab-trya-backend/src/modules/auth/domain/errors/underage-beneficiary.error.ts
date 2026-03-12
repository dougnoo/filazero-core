import { DomainError } from './domain.error';

export class UnderageBeneficiaryError extends DomainError {
  constructor() {
    super('Beneficiário menor de idade');
  }
}
