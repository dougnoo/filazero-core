import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/shared/services/api";

export interface ChronicCondition {
  id: string;
  name: string;
}

interface UseChronicConditionsSearchResult {
  conditions: ChronicCondition[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearResults: () => void;
}

/**
 * Hook para busca de condições crônicas com debounce de 500ms.
 * Reutiliza a lógica do onboarding step1.
 * 
 * @example
 * const { conditions, isLoading, searchTerm, setSearchTerm, clearResults } = useChronicConditionsSearch();
 */
export function useChronicConditionsSearch(): UseChronicConditionsSearchResult {
  const [searchTerm, setSearchTerm] = useState("");
  const [conditions, setConditions] = useState<ChronicCondition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConditions = useCallback(async (searchName: string) => {
    setIsLoading(true);
    try {
      const endpoint = `/api/chronic-conditions?name=${encodeURIComponent(searchName.trim())}`;
      const data = await api.get<ChronicCondition[]>(endpoint, "Erro ao buscar condições");
      setConditions(Array.isArray(data) ? data : []);
    } catch {
      setConditions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm.trim()) {
      setConditions([]);
      return;
    }

    // Debounce de 500ms conforme requisito 4.5
    searchTimeoutRef.current = setTimeout(() => {
      fetchConditions(searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchConditions]);

  const clearResults = useCallback(() => {
    setConditions([]);
    setSearchTerm("");
  }, []);

  return {
    conditions,
    isLoading,
    searchTerm,
    setSearchTerm,
    clearResults,
  };
}
