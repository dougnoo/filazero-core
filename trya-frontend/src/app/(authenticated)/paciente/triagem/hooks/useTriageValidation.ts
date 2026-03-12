"use client";

import { useState, useEffect, useCallback } from "react";
import {
  triageStatusService,
  TriageValidationStatus,
} from "@/shared/services/triageStatusService";

interface UseTriageValidationResult {
  /** Status de validação médica */
  validationStatus: TriageValidationStatus | null;
  /** Se está carregando os dados */
  isLoading: boolean;
  /** Erro, se houver */
  error: Error | null;
  /** Função para recarregar os dados */
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar e gerenciar o status de validação médica da triagem
 */
export function useTriageValidation(): UseTriageValidationResult {
  const [validationStatus, setValidationStatus] =
    useState<TriageValidationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchValidationStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const status = await triageStatusService.getValidationStatus();
      setValidationStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro desconhecido"));
      setValidationStatus({ hasValidation: false });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchValidationStatus();
  }, [fetchValidationStatus]);

  return {
    validationStatus,
    isLoading,
    error,
    refetch: fetchValidationStatus,
  };
}

