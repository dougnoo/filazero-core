import { useState, useEffect, useCallback } from "react";
import { medicalApprovalRequestsService } from "@/shared/services/medicalApprovalRequestsService";
import type { 
  MedicalApprovalRequestItem, 
  ListMedicalApprovalRequestsParams 
} from "../types";

interface UseMedicalApprovalRequestsResult {
  medicalApprovalRequests: MedicalApprovalRequestItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  isLoading: boolean;
  error: string | null;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setFilters: (filters: ListMedicalApprovalRequestsParams) => void;
  refetch: () => void;
}

export function useMedicalApprovalRequests(): UseMedicalApprovalRequestsResult {
  const [medicalApprovalRequests, setMedicalApprovalRequests] = useState<MedicalApprovalRequestItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListMedicalApprovalRequestsParams>({});

  const fetchMedicalApprovalRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await medicalApprovalRequestsService.list({
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      });

      setMedicalApprovalRequests(response.data);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching medical approval requests:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar solicitações de aprovação médica"
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  useEffect(() => {
    fetchMedicalApprovalRequests();
  }, [fetchMedicalApprovalRequests]);

  return {
    medicalApprovalRequests,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    isLoading,
    error,
    setCurrentPage,
    setItemsPerPage,
    setFilters,
    refetch: fetchMedicalApprovalRequests,
  };
}