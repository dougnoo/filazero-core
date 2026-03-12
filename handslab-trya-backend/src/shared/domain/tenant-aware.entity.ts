import { BaseEntity } from './base.entity';

/**
 * Entidade base para todas as entidades que pertencem a um tenant
 */
export abstract class TenantAwareEntity extends BaseEntity {
  constructor(
    id: string,
    public readonly tenantId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  /**
   * Verifica se a entidade pertence ao tenant especificado
   */
  public belongsToTenant(tenantId: string): boolean {
    return this.tenantId === tenantId;
  }
}
