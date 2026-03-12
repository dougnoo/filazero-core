import { api } from '@/shared/services/api';

export enum TermType {
  TERMS_OF_USE = 'TERMS_OF_USE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
}

export enum TermStatus {
  COMPLETO = 'COMPLETO',
  FALHA = 'FALHA',
  PENDENTE = 'PENDENTE',
}

export interface TermListItem {
  id: string;
  type: TermType;
  version: string;
  effectiveDate: string;
  uploadedBy: string;
  uploadDate: string;
  status: TermStatus;
  s3Url?: string;
}

export interface TermsListingResponse {
  items: TermListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TermsListingFilters {
  type: TermType;
  search?: string;
  status?: TermStatus | '';
  page?: number;
  pageSize?: number;
}

const emptyResponse: TermsListingResponse = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
};

export const termsListingService = {
  getTermsList: async (filters: TermsListingFilters): Promise<TermsListingResponse> => {
    const params = new URLSearchParams();
    params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    params.append('page', String(filters.page || 1));
    params.append('pageSize', String(filters.pageSize || 10));

    try {
      const response = await api.get<TermsListingResponse | null>(
        `/api/terms/list?${params.toString()}`
      );

      if (!response) {
        return emptyResponse;
      }

      return {
        items: response.items || [],
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.pageSize || 10,
        totalPages: response.totalPages || 0,
      };
    } catch {
      return emptyResponse;
    }
  },

  reprocessTerm: async (id: string): Promise<void> => {
    await api.post(`/api/terms/${id}/reprocess`);
  },

  getTermById: async (id: string): Promise<TermListItem> => {
    const response = await api.get<TermListItem>(`/api/terms/${id}`);
    return response as TermListItem;
  },
};
