import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/shared/services/api";

export interface Medication {
  id: string;
  name: string;
  activePrinciple: string;
}

interface UseMedicationsSearchResult {
  medications: Medication[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearResults: () => void;
}

/**
 * Hook para busca de medicamentos com debounce de 500ms.
 * Reutiliza a lógica do onboarding step2.
 * 
 * @example
 * const { medications, isLoading, searchTerm, setSearchTerm, clearResults } = useMedicationsSearch();
 */
export function useMedicationsSearch(): UseMedicationsSearchResult {
  const [searchTerm, setSearchTerm] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMedications = useCallback(async (searchName: string) => {
    setIsLoading(true);
    try {
      const endpoint = `/api/medications?name=${encodeURIComponent(searchName.trim())}`;
      const data = await api.get<Medication[]>(endpoint, "Erro ao buscar medicamentos");
      setMedications(Array.isArray(data) ? data : []);
    } catch {
      setMedications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm.trim()) {
      setMedications([]);
      return;
    }

    // Debounce de 500ms conforme requisito 4.6
    searchTimeoutRef.current = setTimeout(() => {
      fetchMedications(searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchMedications]);

  const clearResults = useCallback(() => {
    setMedications([]);
    setSearchTerm("");
  }, []);

  return {
    medications,
    isLoading,
    searchTerm,
    setSearchTerm,
    clearResults,
  };
}
