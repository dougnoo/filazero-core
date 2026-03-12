import { useState, useEffect } from "react";
import { medicalApprovalRequestsService } from "@/shared/services/medicalApprovalRequestsService";
import type { PatientHistoryItem } from "@/shared/services/medicalApprovalRequestsService";

export function usePatientHistory(patientId?: string) {
  const [history, setHistory] = useState<PatientHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await medicalApprovalRequestsService.getPatientHistory(
          patientId
        );
        setHistory(response.history);
      } catch (err) {
        console.error("Error fetching patient history:", err);
        setError("Erro ao carregar histórico do paciente");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  return {
    history,
    loading,
    error,
  };
}
