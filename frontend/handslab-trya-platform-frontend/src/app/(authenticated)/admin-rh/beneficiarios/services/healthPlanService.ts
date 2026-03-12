import { api } from "@/shared/services/api";

export interface HealthPlan {
  id: string;
  name: string;
}

export interface HealthPlansResponse {
  data?: HealthPlan[];
  healthPlans?: HealthPlan[];
}

/**
 * Service para operações relacionadas a planos de saúde
 */
export const healthPlanService = {
  /**
   * Lista planos de saúde, opcionalmente filtrados por operadora
   * @param operatorId - ID da operadora para filtrar os planos (deve ser um UUID válido)
   */
  async list(operatorId?: string): Promise<HealthPlan[]> {
    try {
      let endpoint = "/api/health-plans";
      
      if (operatorId && operatorId.trim()) {
        // Valida se é um UUID válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(operatorId)) {
          return [];
        }
        
        const params = new URLSearchParams({
          operatorId: operatorId.trim(),
          name: "emp",
        });
        endpoint = `/api/health-plans?${params.toString()}`;
      }

      const response = await api.get<HealthPlansResponse | HealthPlan[]>(
        endpoint,
        "Erro ao carregar lista de planos de saúde"
      );

      // Trata diferentes formatos de resposta
      if (Array.isArray(response)) {
        return response;
      }

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      if (response.healthPlans && Array.isArray(response.healthPlans)) {
        return response.healthPlans;
      }

      return [];
    } catch (error) {
      return [];
    }
  },
};

