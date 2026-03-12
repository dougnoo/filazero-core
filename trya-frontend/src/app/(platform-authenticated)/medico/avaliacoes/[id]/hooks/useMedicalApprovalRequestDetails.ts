import { useState, useEffect } from "react";
import { medicalApprovalRequestsService } from "@/shared/services/medicalApprovalRequestsService";
import type {
  MedicalApprovalRequest,
  BeneficiaryDetails,
  AttachmentDetails,
} from "../../../types";

interface UseMedicalApprovalRequestDetailsReturn {
  medicalApprovalRequest: MedicalApprovalRequest | null;
  beneficiary: BeneficiaryDetails | null;
  attachments: AttachmentDetails[];
  
  // Estados separados para cada componente
  marLoading: boolean;
  beneficiaryLoading: boolean;
  
  marError: string | null;
  beneficiaryError: string | null;
  
  // Refetch separados
  refetchMar: () => Promise<void>;
  refetchBeneficiary: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

/**
 * Hook para gerenciar os detalhes de uma Medical Approval Request (MAR)
 * Retorna os dados da API diretamente sem mapeamento
 */
export function useMedicalApprovalRequestDetails(
  requestId: string
): UseMedicalApprovalRequestDetailsReturn {
  const [medicalApprovalRequest, setMedicalApprovalRequest] =
    useState<MedicalApprovalRequest | null>(null);
  const [beneficiary, setBeneficiary] = useState<BeneficiaryDetails | null>(
    null
  );
  const [attachments, setAttachments] = useState<AttachmentDetails[]>([]);
  
  // Estados separados
  const [marLoading, setMarLoading] = useState(true);
  const [beneficiaryLoading, setBeneficiaryLoading] = useState(true);
  
  const [marError, setMarError] = useState<string | null>(null);
  const [beneficiaryError, setBeneficiaryError] = useState<string | null>(null);

  const fetchMedicalApprovalRequest = async () => {
    try {
      setMarLoading(true);
      setMarError(null);

      const medicalApprovalRequestResponse = await medicalApprovalRequestsService.getById(requestId);
      
      setMedicalApprovalRequest(medicalApprovalRequestResponse);
      setAttachments(medicalApprovalRequestResponse.attachments || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados da solicitação";
      setMarError(errorMessage);
      console.error("Erro ao buscar MAR:", err);
    } finally {
      setMarLoading(false);
    }
  };

  const fetchBeneficiary = async () => {
    try {
      setBeneficiaryLoading(true);
      setBeneficiaryError(null);

      const beneficiaryResponse = await medicalApprovalRequestsService.getBeneficiaryDetails(requestId);
      
      setBeneficiary(beneficiaryResponse);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados do beneficiário";
      setBeneficiaryError(errorMessage);
      console.error("Erro ao buscar beneficiário:", err);
    } finally {
      setBeneficiaryLoading(false);
    }
  };

  const fetchAll = async () => {
    await Promise.all([
      fetchMedicalApprovalRequest(),
      fetchBeneficiary(),
    ]);
  };

  useEffect(() => {
    if (requestId) {
      fetchAll();
    }
  }, [requestId]);

  return {
    medicalApprovalRequest,
    beneficiary,
    attachments,
    
    marLoading,
    beneficiaryLoading,
    
    marError,
    beneficiaryError,
    
    refetchMar: fetchMedicalApprovalRequest,
    refetchBeneficiary: fetchBeneficiary,
    refetchAll: fetchAll,
  };
}
