/**
 * useMemedDialog Hook
 *
 * React hook for managing Memed integration in embedded dialog mode.
 * Provides a dialog-based interface instead of fullscreen for doctor evaluations.
 */

import { useState, useCallback } from "react";
import { memedService } from "@/shared/services/memedService";
import { useToast } from "@/shared/hooks/useToast";
import { MemedBeneficiaryData } from "@/app/(platform-authenticated)/medico/types/memed";

export function useMemedDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPatientName, setCurrentPatientName] = useState<string>("");
  const { showError } = useToast();

  const openMemedDialog = useCallback(
    async (doctorId: string, beneficiary: MemedBeneficiaryData, sessionId?: string, requestId?: string) => {
      try {
        setIsLoading(true);
        setCurrentPatientName(beneficiary.name);
        setIsDialogOpen(true);

        // Set callback to clear loading when module is shown
        memedService.setOnModuleShownCallback(() => {
          setIsLoading(false);
        });

        // Initialize Memed script in embedded mode
        await memedService.initMemedEmbedded(
          doctorId, 
          beneficiary, 
          "memed-prescription-container",
          sessionId,
          requestId
        );

        // Keep loading state until module is shown
        // The loading will be cleared by the callback
      } catch (error) {
        showError("Erro ao abrir prescrição médica");
        setIsLoading(false);
        setIsDialogOpen(false);
        memedService.clearOnModuleShownCallback();
        throw error;
      }
    },
    [showError]
  );

  const closeMemedDialog = useCallback(() => {
    memedService.cleanup();
    setIsDialogOpen(false);
    setIsLoading(false);
    setCurrentPatientName("");
  }, []);

  const cleanup = useCallback(() => {
    memedService.cleanup();
    setIsDialogOpen(false);
    setIsLoading(false);
    setCurrentPatientName("");
  }, []);

  return {
    isDialogOpen,
    isLoading,
    currentPatientName,
    openMemedDialog,
    closeMemedDialog,
    cleanup,
  };
}