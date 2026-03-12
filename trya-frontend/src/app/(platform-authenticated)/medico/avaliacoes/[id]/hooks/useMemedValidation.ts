import { useState, useEffect } from "react";
import { memedService } from "@/shared/services/memedService";
import { usePlatformAuth } from "@/shared/hooks/usePlatformAuth";
import { MedicalApprovalRequest } from "../../../types";

interface UseMemedValidationResult {
  canApprove: boolean;
  isLoading: boolean;
  error: string | null;
  syncStatus: {
    hasSyncedMemed: boolean;
    isAttributedDoctor: boolean;
  };
  refetch: () => void;
}

export function useMemedValidation(
  evaluationId: string,
  medicalApprovalRequest?: MedicalApprovalRequest
): UseMemedValidationResult {
  const { user } = usePlatformAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSyncedMemed, setHasSyncedMemed] = useState(false);
  const [isAttributedDoctor, setIsAttributedDoctor] = useState(false);

  const checkValidation = async () => {
    if (!user?.id || !medicalApprovalRequest) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if doctor is synced with Memed
      const syncStatus = await memedService.checkSyncStatus(user.id);
      setHasSyncedMemed(syncStatus);

      // Check if doctor is attributed to this evaluation
      // This checks if the current user is the assigned doctor and status allows approval
      const isAttributed =
        medicalApprovalRequest.assignedDoctorId === user.id;

      setIsAttributedDoctor(isAttributed);
    } catch (err) {
      console.error("Error validating Memed status:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao validar status do Memed"
      );
      setHasSyncedMemed(false);
      setIsAttributedDoctor(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkValidation();
  }, [
    user?.id,
    evaluationId,
    medicalApprovalRequest?.id,
    medicalApprovalRequest?.status,
    medicalApprovalRequest?.assignedDoctorId,
  ]);

  const canApprove = hasSyncedMemed && isAttributedDoctor;

  return {
    canApprove,
    isLoading,
    error,
    syncStatus: {
      hasSyncedMemed,
      isAttributedDoctor,
    },
    refetch: checkValidation,
  };
}
