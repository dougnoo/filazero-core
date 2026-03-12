import { Tenant } from '../../../../database/entities/tenant.entity';

export interface CreateTenantData {
  name: string;
  operatorId?: string;
}

export interface UpdateTenantData {
  name?: string;
  operatorId?: string;
}

export interface ListTenantsFilters {
  active?: boolean;
  limit?: number;
  offset?: number;
}

export interface ITenantRepository {
  /**
   * Cria um novo tenant
   * @param data - Dados do tenant
   * @returns Tenant criado
   */
  create(data: CreateTenantData): Promise<Tenant>;

  /**
   * Busca um tenant pelo ID
   * @param id - ID do tenant
   * @returns Tenant encontrado ou null
   */
  findById(id: string): Promise<Tenant | null>;

  /**
   * Busca um tenant pelo nome
   * @param name - Nome do tenant
   * @returns Tenant encontrado ou null
   */
  findByName(name: string): Promise<Tenant | null>;

  /**
   * Lista tenants com filtros
   * @param filters - Filtros para listagem
   * @returns Lista de tenants
   */
  list(filters: ListTenantsFilters): Promise<Tenant[]>;

  /**
   * Atualiza dados de um tenant
   * @param id - ID do tenant
   * @param data - Dados a serem atualizados
   * @returns Tenant atualizado
   */
  update(id: string, data: UpdateTenantData): Promise<Tenant>;

  /**
   * Remove um tenant (soft delete - marca como inativo)
   * @param id - ID do tenant
   */
  delete(id: string): Promise<void>;

  /**
   * Atualiza a operadora de um tenant
   * @param tenantId - ID do tenant
   * @param operatorId - ID da nova operadora
   * @returns Tenant atualizado
   */
  updateOperator(tenantId: string, operatorId: string): Promise<Tenant>;
}
