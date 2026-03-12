import { DomainError } from './domain.error';

export class MissingRequiredFieldsError extends DomainError {
  constructor(
    public readonly fields: string[],
    public readonly rowNumber: number,
  ) {
    super(`Campos obrigatórios ausentes: ${fields.join(', ')}`);
    this.name = 'MissingRequiredFieldsError';
  }
}
