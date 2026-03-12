"use client";

import { useParams } from "next/navigation";
import { Box, Typography, Alert } from "@mui/material";
import { AdjustmentsModal } from "./components/AdjustmentsModal";
import { ApprovalConfirmationModal } from "./components/ApprovalConfirmationModal";
import { useMedicalApprovalRequestDetails } from "./hooks/useMedicalApprovalRequestDetails";
import { useAttachmentDownload } from "./hooks/useAttachmentDownload";
import { useMemedValidation } from "./hooks/useMemedValidation";
import { usePlatformAuth } from "@/shared/hooks/usePlatformAuth";
import { useMemedDialog } from "./hooks/useMemedDialog";
import { MemedDialog } from "./components/MemedDialog";
import { memedService } from "@/shared/services/memedService";
import { medicalApprovalRequestsService } from "@/shared/services/medicalApprovalRequestsService";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/hooks/useToast";
import type { AttachmentDetails } from "../../types";

export default function MedicalApprovalRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;
  const router = useRouter();
  const { user } = usePlatformAuth();

  // Hooks para gerenciar dados da MAR
  const {
    medicalApprovalRequest,
    beneficiary,
    attachments,
    marLoading,
    beneficiaryLoading,
    marError,
    beneficiaryError,
    refetchMar,
    refetchBeneficiary,
  } = useMedicalApprovalRequestDetails(requestId);

  // Hook para validação do Memed
  const {
    canApprove,
    isLoading: validationLoading,
    syncStatus,
  } = useMemedValidation(requestId, medicalApprovalRequest || undefined);

  const { downloadAttachmentFromDetails } = useAttachmentDownload(requestId);
  const {
    isDialogOpen,
    isLoading: memedLoading,
    currentPatientName,
    openMemedDialog,
    closeMemedDialog,
  } = useMemedDialog();
  const [showAdjustments, setShowAdjustments] = useState(false);
  // Modal states
  const [doctorsNote, setDoctorsNote] = useState("");

  // New states for prescription workflow
  const [showApprovalConfirmation, setShowApprovalConfirmation] =
    useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleStartPrescription = async () => {
    // Check if doctor can approve
    if (!canApprove || !user || !beneficiary || !medicalApprovalRequest) {
      return; // Buttons should be disabled, but extra safety check
    }

    try {
      // Convert BeneficiaryDetails to MemedBeneficiaryData
      // Note: CPF is passed complete (not anonymized) as required by Memed integration
      // Anonymization happens only in UI components for display
      const memedBeneficiaryData = {
        id: beneficiary.id,
        name: beneficiary.name,
        cpf: beneficiary.cpf, // Complete CPF for Memed integration
        phone: beneficiary.phone,
        birthDate: beneficiary.birthDate, // Already in correct format
        gender: beneficiary.gender, // Already in correct format
        // Optional fields - not available in BeneficiaryDetails
        // email: beneficiary.email,
        // mother_name: beneficiary.mother_name,
        // social_name: beneficiary.social_name,
      };

      // Open Memed in embedded dialog with complete beneficiary data
      // IMPORTANT: Pass both sessionId (for prescription) and requestId (for event comparison)
      await openMemedDialog(
        user.id,
        memedBeneficiaryData,
        medicalApprovalRequest.sessionId,
        requestId
      );
    } catch (error) {
      console.error("Error opening Memed:", error);
    }
  };

  const handleApprove = async () => {
    if (!canApprove || isApproving) {
      return;
    }

    setIsApproving(true);
    try {
      await medicalApprovalRequestsService.approve(requestId, {
        status: "APPROVED",
      });

      showSuccess("Atendimento finalizado com sucesso!");

      // Close modal and redirect after success
      setShowApprovalConfirmation(false);
      setTimeout(() => {
        router.push("/medico");
      }, 2000);
    } catch (error) {
      console.error("Error approving request:", error);
      showError("Erro ao finalizar atendimento. Tente novamente.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleApproveWithNotes = () => {
    // Close confirmation modal and open notes modal
    setShowApprovalConfirmation(false);
    setShowAdjustments(true);
  };

  const handleSaveDoctorsNote = async (notes: string) => {
    setDoctorsNote(notes);
    setShowAdjustments(false);

    // Approve with adjustments
    setIsApproving(true);
    try {
      await medicalApprovalRequestsService.approve(requestId, {
        status: "ADJUSTED",
        doctorNotes: notes,
      });

      showSuccess("Atendimento finalizado com ajustes!");

      // Redirect after success
      setTimeout(() => {
        router.push("/medico");
      }, 2000);
    } catch (error) {
      console.error("Error approving request with adjustments:", error);
      showError("Erro ao aprovar atendimento. Tente novamente.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownload = async (attachment: AttachmentDetails) => {
    if (!medicalApprovalRequest) return;

    try {
      await downloadAttachmentFromDetails(attachment);
    } catch (error) {
      console.error("Erro ao fazer download:", error);
    }
  };

  const handleView = async (attachment: AttachmentDetails) => {
    if (!medicalApprovalRequest) return;

    try {
      // Para visualização, também fazemos download mas abrimos em nova aba
      await downloadAttachmentFromDetails(attachment);
    } catch (error) {
      console.error("Erro ao visualizar:", error);
    }
  };

  // Atualizar nota do médico quando a MAR for carregada
  useEffect(() => {
    if (medicalApprovalRequest) {
      setDoctorsNote(medicalApprovalRequest.doctorNotes || "");
    }
  }, [medicalApprovalRequest]);

  // Cleanup Memed on unmount only
  useEffect(() => {
    return () => {
      memedService.cleanup();
    };
  }, []); // Empty dependency array - only runs on unmount

  // Listen for prescription completion
  useEffect(() => {
    const handlePrescriptionCompleted = (event: CustomEvent) => {
      const { requestId: completedRequestId } = event.detail;
      if (completedRequestId === requestId) {
        // Close Memed dialog and show approval confirmation modal
        closeMemedDialog();
        setShowApprovalConfirmation(true);
        showSuccess("Prescrição criada com sucesso!");
      }
    };

    window.addEventListener(
      "prescriptionCompleted",
      handlePrescriptionCompleted as EventListener
    );

    return () => {
      window.removeEventListener(
        "prescriptionCompleted",
        handlePrescriptionCompleted as EventListener
      );
    };
  }, [requestId, closeMemedDialog, showSuccess]);

  // Render validation error message
  const renderValidationMessage = () => {
    if (validationLoading) {
      return null; // Don't show anything while loading
    }

    if (!syncStatus.hasSyncedMemed) {
      return (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: "12px" }}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography
                component="button"
                onClick={() => router.push("/medico/perfil#memed-integration")}
                sx={{
                  color: "#ED6C02",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Sincronizar agora
              </Typography>
            </Box>
          }
        >
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
            Sincronização com Memed necessária
          </Typography>
          <Typography sx={{ fontSize: "14px" }}>
            Para aprovar prescrições médicas, você precisa sincronizar sua conta
            com a plataforma Memed.
          </Typography>
        </Alert>
      );
    }

    if (!syncStatus.isAttributedDoctor) {
      return (
        <Alert severity="info" sx={{ mb: 3, borderRadius: "12px" }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
            Avaliação não atribuída
          </Typography>
          <Typography sx={{ fontSize: "14px" }}>
            Esta avaliação não está atribuída a você ou não está em um status
            que permite aprovação.
          </Typography>
        </Alert>
      );
    }

    return null;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 4,
      }}
    >
      {/* Content */}
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: 4,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "350px 1fr" },
            gap: 3,
          }}
        >
          {/* Sidebar - Informações do Paciente */}
          <Sidebar
            beneficiary={beneficiary || undefined}
            medicalApprovalRequest={medicalApprovalRequest || undefined}
            loading={beneficiaryLoading}
            error={beneficiaryError || undefined}
            onRetry={refetchBeneficiary}
          />

          {/* Main Content - Resumo e Recomendações */}
          <Box>
            {/* Validation Messages */}
            {renderValidationMessage()}

            <MainContent
              medicalApprovalRequest={medicalApprovalRequest || undefined}
              attachments={attachments}
              loading={marLoading}
              error={marError || undefined}
              onRetry={refetchMar}
              onDownload={handleDownload}
              onView={handleView}
              onStartPrescription={handleStartPrescription}
              // Pass validation state to disable buttons
              canApprove={canApprove}
              validationLoading={validationLoading}
              // Pass Memed loading state
              memedLoading={memedLoading}
            />
          </Box>
        </Box>
      </Box>

      {/* Modal de Confirmação de Aprovação */}
      <ApprovalConfirmationModal
        open={showApprovalConfirmation}
        onApprove={handleApprove}
        onApproveWithNotes={handleApproveWithNotes}
        isApproving={isApproving}
        patientName={beneficiary?.name}
      />

      {/* Modal de Nota do Médico */}
      <AdjustmentsModal
        open={showAdjustments}
        onClose={() => setShowAdjustments(false)}
        onSave={handleSaveDoctorsNote}
        initialNotes={doctorsNote}
      />

      {/* Memed Embedded Dialog */}
      <MemedDialog
        open={isDialogOpen}
        onClose={closeMemedDialog}
        isLoading={memedLoading}
        patientName={currentPatientName}
      />
    </Box>
  );
}
