import { api } from "@/shared/services/api";
import { normalizeArrayResponse } from "@/shared/utils";

export interface Tenant {
  id: string;
  name: string;
}

export interface TenantsResponse {
  data?: Tenant[];
  tenants?: Tenant[];
}

/**
 * Service para operações relacionadas a tenants/empresas
 */
export const tenantService = {
  /**
   * Lista todos os tenants ativos
   */
  async listActive(): Promise<Tenant[]> {
    try {
      const response = await api.get<TenantsResponse | Tenant[]>(
        "/api/tenants?activeOnly=true",
        "Erro ao carregar lista de empresas"
      );
      return normalizeArrayResponse<Tenant>(response, ["data", "tenants"]);
    } catch (error) {
      return [];
    }
  },
};

