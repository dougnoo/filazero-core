import { api } from "@/shared/services/api";

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

      // Trata diferentes formatos de resposta
      if (Array.isArray(response)) {
        return response;
      }

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      if (response.tenants && Array.isArray(response.tenants)) {
        return response.tenants;
      }

      return [];
    } catch (error) {
      return [];
    }
  },
};

