import { useState, useCallback } from "react";
import { api } from "@/shared/services/api";
import type { ChronicCondition } from "./useChronicConditionsSearch";
import type { Medication } from "./useMedicationsSearch";

/**
 * Estado do dialog de dados de saúde
 */
export interface HealthDataDialogState {
  selectedConditions: ChronicCondition[];
  selectedMedications: Medication[];
  allergiesText: string;
}

/**
 * Payload enviado para a API de onboard
 */
interface OnboardPayload {
  chronicConditionIds: string[];
  medications: Array<{ medicationId: string; dosage: null }>;
  allergies: string;
}

interface UseHealthDataSubmitResult {
  submit: (data: HealthDataDialogState) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Hook para submissão dos dados de saúde via POST /api/onboard.
 * Gerencia estados de loading e erro.
 * 
 * @example
 * const { submit, isSubmitting, error } = useHealthDataSubmit();
 * 
 * const handleSubmit = async () => {
 *   await submit({
 *     selectedConditions: [...],
 *     selectedMedications: [...],
 *     allergiesText: "..."
 *   });
 * };
 * 
 * Requirements: 6.1, 6.3
 */
export function useHealthDataSubmit(): UseHealthDataSubmitResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: HealthDataDialogState): Promise<void> => {
    // Limpa erro anterior ao iniciar nova submissão
    setError(null);
    setIsSubmitting(true);

    try {
      // Transforma o estado do dialog para o formato da API
      const payload: OnboardPayload = {
        chronicConditionIds: data.selectedConditions.map((c) => c.id),
        medications: data.selectedMedications.map((m) => ({
          medicationId: m.id,
          dosage: null,
        })),
        allergies: data.allergiesText,
      };

      await api.post("/api/onboard", payload, "Erro ao salvar dados de saúde");
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Erro ao salvar dados de saúde";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    submit,
    isSubmitting,
    error,
  };
}
