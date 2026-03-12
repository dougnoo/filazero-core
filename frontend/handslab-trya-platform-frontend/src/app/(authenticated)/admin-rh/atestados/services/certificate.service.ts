import { api } from "@/shared/services/api";
import type {
  CertificateListResponse,
  CertificateDetail,
  CertificateFilters,
} from "../types/certificate.types";

export const certificateService = {
  listHR: async (
    page: number = 1, 
    limit: number = 10, 
    filters?: CertificateFilters
  ): Promise<CertificateListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add search filters to query parameters
    if (filters?.name) {
      params.append('name', filters.name);
    }
    if (filters?.date) {
      params.append('date', filters.date);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }

    return api.get<CertificateListResponse>(
      `/api/medical-certificates/hr?${params.toString()}`,
      "Erro ao buscar atestados"
    );
  },

  getByIdHR: async (id: string): Promise<CertificateDetail> => {
    return api.get<CertificateDetail>(
      `/api/medical-certificates/hr/${id}`,
      "Erro ao buscar detalhes do atestado"
    );
  },
};
