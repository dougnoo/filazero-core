import { DomainError } from './domain.error';

export class DuplicateTitularMemberIdError extends DomainError {
  constructor(
    public readonly rowNumber: number,
    public readonly memberId: string,
  ) {
    super(`Matrícula já usada por outro titular: ${memberId}`);
    this.name = 'DuplicateTitularMemberIdError';
  }
}
