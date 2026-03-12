/**
 * Entidade base para todas as entidades do sistema
 */
export abstract class BaseEntity {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Verifica se a entidade é igual a outra com base no ID
   */
  public equals(other: BaseEntity): boolean {
    if (!other) {
      return false;
    }
    return this.id === other.id;
  }
}
