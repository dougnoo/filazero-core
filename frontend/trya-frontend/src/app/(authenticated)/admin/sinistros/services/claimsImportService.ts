import { platformApi } from "@/shared/services/platformApi";

export type ClaimImportStatus = "processing" | "completed" | "failed";

export interface ClaimImportRecord {
  id: string;
  filename: string;
  userName?: string;
  status: ClaimImportStatus;
  startedAt: string;
  errorMessage?: string;
  summary?: {
    totalRows: number;
    importedClaims: number;
    matchedClaims: number;
    unmatchedClaims: number;
    avgMatchConfidence: number;
  };
}

export interface ClaimImportResponseDto {
  batchId: string;
  importedAt: Date;
  stats: unknown;
  errors: string[];
  unmatchedProviders: string[];
  processingTimeSeconds: number;
}

export interface ListImportsParams {
  search?: string;
  status?: string;
  operatorId?: string;
  page?: number;
  limit?: number;
}

export interface ImportsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const claimsImportService = {
  /**
   * Lista importações de sinistros com filtros e paginação via API
   * GET /network-providers/claims
   */
  async listImports(params?: ListImportsParams): Promise<{
    imports: ClaimImportRecord[];
    pagination: ImportsPagination;
  }> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.operatorId) query.set("operatorId", params.operatorId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return platformApi.get<{ imports: ClaimImportRecord[]; pagination: ImportsPagination }>(
      `/network-providers/claims${qs ? `?${qs}` : ""}`
    );
  },

  /**
   * Importa planilha de sinistros via multipart/form-data
   * POST /network-providers/claims/import
   */
  async importClaims(file: File): Promise<ClaimImportResponseDto> {
    const formData = new FormData();
    formData.append("file", file);

    return platformApi.post<ClaimImportResponseDto>(
      "/network-providers/claims/import",
      formData
    );
  },

  /**
   * Reprocessa uma importação falha
   * POST /network-providers/claims/imports/:importId/reprocess
   */
  async reprocessImport(importId: string): Promise<ClaimImportResponseDto> {
    return platformApi.post<ClaimImportResponseDto>(
      `/network-providers/claims/imports/${importId}/reprocess`,
      undefined
    );
  },
};
