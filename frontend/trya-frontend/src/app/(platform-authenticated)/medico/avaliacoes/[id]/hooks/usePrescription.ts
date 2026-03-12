import { useState, useEffect } from 'react';
import { prescriptionService, PrescriptionResponse } from '@/shared/services/prescriptionService';

interface UsePrescriptionResult {
  prescription: PrescriptionResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePrescription(sessionId: string): UsePrescriptionResult {
  const [prescription, setPrescription] = useState<PrescriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescription = async () => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await prescriptionService.getPrescriptionBySession(sessionId);
      setPrescription(result);
    } catch (err) {
      console.error('Error fetching prescription:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar prescrição');
      setPrescription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescription();
  }, [sessionId]);

  return {
    prescription,
    isLoading,
    error,
    refetch: fetchPrescription,
  };
}