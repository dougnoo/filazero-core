import { api } from "@/shared/services/api";

export interface HealthOperator {
  id: string;
  name: string;
}

export interface HealthOperatorsResponse {
  data?: HealthOperator[];
  healthOperators?: HealthOperator[];
}

/**
 * Service para operações relacionadas a operadoras de saúde
 */
export const healthOperatorService = {
  /**
   * Lista todas as operadoras de saúde
   */
  async list(): Promise<HealthOperator[]> {
    try {
      const response = await api.get<HealthOperatorsResponse | HealthOperator[]>(
        "/api/health-operators",
        "Erro ao carregar lista de operadoras"
      );

      // Trata diferentes formatos de resposta
      if (Array.isArray(response)) {
        return response;
      }

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      if (response.healthOperators && Array.isArray(response.healthOperators)) {
        return response.healthOperators;
      }

      return [];
    } catch (error) {
      return [];
    }
  },
};

