import { api } from "@/shared/services/api";
import { PLATFORM_API_BASE_URL } from "@/shared/config/platformApi.config";
import { getPlatformToken, platformApi } from "@/shared/services/platformApi";

export interface ImportError {
  rowNumber: number;
  columnName?: string;
  reason: string;
  suggestion?: string;
}

export interface ImportResult {
  id: string;
  filename: string;
  status: "processing" | "completed" | "failed";
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  newLocations: number;
  newProviders: number;
  updatedProviders: number;
  newServices: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface HealthOperator {
  id: string;
  name: string;
  status: "CADASTRADA" | "REDE_CREDENCIADA_DISPONIVEL";
}

export const networkImportService = {
  /**
   * Lista operadoras disponíveis para importação
   * Usa o backend principal (trya-backend)
   */
  async listOperators(): Promise<HealthOperator[]> {
    try {
      const response = await api.get<HealthOperator[]>(
        "/api/health-operators",
        "Erro ao carregar operadoras"
      );
      return Array.isArray(response) ? response : [];
    } catch {
      return [];
    }
  },

  /**
   * Cadastra uma nova operadora
   * Usa o backend principal (trya-backend)
   */
  async createOperator(name: string): Promise<HealthOperator> {
    return api.post<HealthOperator>(
      "/api/health-operators",
      { name },
      "Erro ao cadastrar operadora"
    );
  },

  /**
   * Importa rede credenciada
   * Usa o platform-backend (requer autenticação)
   */
  async importNetwork(
    operatorId: string,
    operatorName: string,
    file: File
  ): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("operatorId", operatorId);
    formData.append("operatorName", operatorName);

    const result = await platformApi.post<Record<string, unknown>>(
      "/network-providers/import",
      formData,
      "Erro ao importar rede credenciada"
    );
    
    // Normaliza a resposta do platform-backend
    return {
      id: result.import?.id || result.importId || result.id || "",
      filename: result.import?.filename || result.filename || file.name,
      status: result.import?.status || result.status || "completed",
      totalRows: result.import?.totalRows || result.summary?.totalRows || result.totalRows || 0,
      processedRows: result.import?.processedRows || result.summary?.processedRows || result.processedRows || 0,
      successRows: result.import?.successRows || result.successRows || 0,
      errorRows: result.import?.errorRows || result.errorRows || 0,
      newLocations: result.import?.newLocations || result.summary?.newLocations || result.newLocations || 0,
      newProviders: result.import?.newProviders || result.summary?.newProviders || result.newProviders || 0,
      updatedProviders: result.import?.updatedProviders || result.updatedProviders || 0,
      newServices: result.import?.newServices || result.summary?.newServices || result.newServices || 0,
      startedAt: result.import?.startedAt || result.startedAt || new Date().toISOString(),
      completedAt: result.import?.completedAt || result.completedAt,
      errorMessage: result.import?.errorMessage || result.errorMessage,
    };
  },

  /**
   * Consulta a última importação, opcionalmente filtrada por operadora
   */
  async getLatestImport(operatorId?: string): Promise<{ success: boolean; import: ImportResult | null }> {
    const url = operatorId 
      ? `/network-providers/imports/latest?operatorId=${operatorId}`
      : "/network-providers/imports/latest";
    return platformApi.get<{ success: boolean; import: ImportResult | null }>(url);
  },

  /**
   * Lista todas as importações, opcionalmente filtradas por operadora
   */
  async listImports(operatorId?: string): Promise<{ success: boolean; imports: ImportResult[] }> {
    const url = operatorId 
      ? `/network-providers/imports?operatorId=${operatorId}`
      : "/network-providers/imports";
    return platformApi.get<{ success: boolean; imports: ImportResult[] }>(url);
  },

  /**
   * Lista importações (stats)
   */
  async getStats(): Promise<unknown> {
    return platformApi.get("/network-providers/stats");
  },

  /**
   * Reprocessa uma importação falha usando o arquivo salvo no S3
   */
  async reprocessImport(importId: string): Promise<ImportResult> {
    const result = await platformApi.post<ImportResult>(
      `/network-providers/imports/${importId}/reprocess`,
      undefined
    );
    
    return {
      id: result.import?.id || result.importId || result.id || importId,
      filename: result.import?.filename || result.filename || "",
      status: result.import?.status || result.status || "processing",
      totalRows: result.import?.totalRows || result.summary?.totalRows || result.totalRows || 0,
      processedRows: result.import?.processedRows || result.summary?.processedRows || result.processedRows || 0,
      successRows: result.import?.successRows || result.successRows || 0,
      errorRows: result.import?.errorRows || result.errorRows || 0,
      newLocations: result.import?.newLocations || result.summary?.newLocations || result.newLocations || 0,
      newProviders: result.import?.newProviders || result.summary?.newProviders || result.newProviders || 0,
      updatedProviders: result.import?.updatedProviders || result.updatedProviders || 0,
      newServices: result.import?.newServices || result.summary?.newServices || result.newServices || 0,
      startedAt: result.import?.startedAt || result.startedAt || new Date().toISOString(),
      completedAt: result.import?.completedAt || result.completedAt,
      errorMessage: result.import?.errorMessage || result.errorMessage,
    };
  },

  /**
   * Baixa o arquivo usado em uma importação
   */
  async downloadImportFile(importId: string, filename: string): Promise<void> {
    const token = getPlatformToken();

    if (!token) {
      throw new Error("Autenticação necessária para baixar arquivo");
    }

    const response = await fetch(
      `${PLATFORM_API_BASE_URL}/network-providers/imports/${importId}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao baixar arquivo");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
