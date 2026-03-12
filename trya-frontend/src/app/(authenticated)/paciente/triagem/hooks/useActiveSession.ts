import { useState, useEffect } from "react";
import { triageHistoryService, TriageSessionResponse } from "../services/triageHistoryService";

export function useActiveSession(shouldFetch: boolean = true) {
  const [activeSession, setActiveSession] = useState<TriageSessionResponse | null>(null);
  const [loading, setLoading] = useState(shouldFetch);

  useEffect(() => {
    if (shouldFetch) {
      loadActiveSession();
    }
  }, [shouldFetch]);

  const loadActiveSession = async () => {
    try {
      setLoading(true);
      const session = await triageHistoryService.getActiveSession();
      setActiveSession(session);
    } catch (err) {
      console.error("Erro ao carregar sessão ativa:", err);
      setActiveSession(null);
    } finally {
      setLoading(false);
    }
  };

  return { activeSession, loading, reload: loadActiveSession };
}
