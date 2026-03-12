import { api } from "@/shared/services/api";
import { normalizeArrayResponse } from "@/shared/utils";

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
        
        endpoint = `/api/health-plans?operatorId=${operatorId.trim()}`;
      }

      const response = await api.get<HealthPlansResponse | HealthPlan[]>(
        endpoint,
        "Erro ao carregar lista de planos de saúde"
      );
      return normalizeArrayResponse<HealthPlan>(response, [
        "data",
        "healthPlans",
      ]);
    } catch (error) {
      console.error("[healthPlanService] Erro ao carregar planos:", error);
      return [];
    }
  },
};

