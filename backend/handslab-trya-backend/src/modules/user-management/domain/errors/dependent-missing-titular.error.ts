import { DomainError } from './domain.error';

export class DependentMissingTitularError extends DomainError {
  constructor(
    public readonly rowNumber: number,
    public readonly memberId: string | null,
  ) {
    const matriculaLabel = memberId
      ? `Matrícula ${memberId}`
      : 'Matrícula não informada';
    super(`Dependente sem titular encontrado. ${matriculaLabel}.`);
    this.name = 'DependentMissingTitularError';
  }
}
