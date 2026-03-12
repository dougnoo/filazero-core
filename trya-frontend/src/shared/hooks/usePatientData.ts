import { useState, useEffect } from "react";
import { api } from "@/shared/services/api";

export interface PatientData {
  name?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  allergies?: string;
  chronicConditions?: Array<{ name: string }>;
  medications?: Array<{ name: string }>;
  tenantName?: string;
  planName?: string;
  activePlan?: {
    planName: string;
    operatorName: string;
    activeUntil?: string | null;
    cardNumber?: string;
  } | null;
}

// Cache global para compartilhar entre componentes
let cachedData: PatientData | null = null;
let cachedError: boolean = false;
let cachedTimestamp: number = 0;
let ongoingRequest: Promise<PatientData> | null = null;

// Listeners para notificar componentes sobre mudanças
const listeners = new Set<() => void>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

async function fetchPatientData(): Promise<PatientData> {
  // Se já existe uma requisição em andamento, retorna ela
  if (ongoingRequest) {
    return ongoingRequest;
  }

  // Verifica se o cache ainda é válido
  const now = Date.now();
  if (cachedData && now - cachedTimestamp < CACHE_DURATION) {
    return cachedData;
  }

  // Cria nova requisição
  ongoingRequest = api
    .get<PatientData>("/api/auth/me", "Erro ao buscar dados do paciente")
    .then((data) => {
      cachedData = data;
      cachedError = false;
      cachedTimestamp = Date.now();
      ongoingRequest = null;
      notifyListeners();
      return data;
    })
    .catch((error) => {
      console.error("Erro ao buscar dados do paciente:", error);
      cachedError = true;
      ongoingRequest = null;
      notifyListeners();
      throw error;
    });

  return ongoingRequest;
}

export function usePatientData() {
  const [data, setData] = useState<PatientData | null>(cachedData);
  const [isLoading, setIsLoading] = useState(!cachedData);
  const [hasError, setHasError] = useState(cachedError);

  useEffect(() => {
    let isMounted = true;

    // Se já tem dados em cache, usa eles
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Busca os dados
    const loadData = async () => {
      try {
        setIsLoading(true);
        const patientData = await fetchPatientData();
        if (isMounted) {
          setData(patientData);
          setHasError(false);
        }
      } catch (error) {
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    // Registra listener para atualizações
    const listener = () => {
      if (isMounted) {
        setData(cachedData);
        setHasError(cachedError);
        setIsLoading(false);
      }
    };

    listeners.add(listener);

    return () => {
      isMounted = false;
      listeners.delete(listener);
    };
  }, []);

  // Função para forçar atualização dos dados
  const refetch = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      // Limpa o cache para forçar nova requisição
      cachedData = null;
      cachedTimestamp = 0;
      const patientData = await fetchPatientData();
      setData(patientData);
    } catch (error) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    hasError,
    refetch,
  };
}

// Função para limpar o cache (útil para logout)
export function clearPatientDataCache() {
  cachedData = null;
  cachedError = false;
  cachedTimestamp = 0;
  ongoingRequest = null;
  notifyListeners();
}
