import { api } from "@/shared/services/api";
import { normalizeArrayResponse } from "@/shared/utils";

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
      return normalizeArrayResponse<HealthOperator>(response, [
        "data",
        "healthOperators",
      ]);
    } catch (error) {
      return [];
    }
  },
};

