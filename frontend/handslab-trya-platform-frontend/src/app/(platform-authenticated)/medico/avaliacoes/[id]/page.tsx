"use client";

import {  useParams } from "next/navigation";
import { Box } from "@mui/material";
import { QRCodeModal } from "@/shared/components/QRCodeModal";
import {
  AdjustmentsModal,
  AdjustmentsData,
} from "./components/AdjustmentsModal";
import { useMedicalApprovalRequestDetails } from "./hooks/useMedicalApprovalRequestDetails";
import { useAttachmentDownload } from "./hooks/useAttachmentDownload";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { useState, useEffect } from "react";
import type { AttachmentDetails } from "../../types";

export default function MedicalApprovalRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

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
  const { downloadAttachmentFromDetails } = useAttachmentDownload(requestId);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  // Modal states
  const [doctorsNote, setDoctorsNote] = useState("");



  const handleApprove = () => {
    setShowSignatureModal(true);
    console.log("Aprovar avaliação");
  };

  const handleApproveWithAdjustments = () => {
    setShowAdjustments(true);
  };

  const handleSaveDoctorsNote = (data: AdjustmentsData) => {
    setDoctorsNote(data.recommendations);
    console.log("Nota do médico salva:", data.recommendations);
    // Fecha o modal de ajustes e abre o modal de assinatura
    setShowAdjustments(false);
    setTimeout(() => {
      setShowSignatureModal(true);
    }, 300); // Delay de 300ms para transição suave
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
      setDoctorsNote(medicalApprovalRequest.doctorsNote || "");
    }
  }, [medicalApprovalRequest]);

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
          <MainContent
            medicalApprovalRequest={medicalApprovalRequest || undefined}
            attachments={attachments}
            loading={marLoading}
            error={marError || undefined}
            onRetry={refetchMar}
            onDownload={handleDownload}
            onView={handleView}
            onApprove={handleApprove}
            onApproveWithAdjustments={handleApproveWithAdjustments}
          />
        </Box>
      </Box>

      {/* Modal de Nota do Médico */}
      <AdjustmentsModal
        open={showAdjustments}
        onClose={() => setShowAdjustments(false)}
        onSave={handleSaveDoctorsNote}
        initialData={{
          initialInteraction: "",
          iaAnalysis: "",
          examsSubmitted: "",
          recommendations: doctorsNote,
        }}
      />

      {/* Modal de Assinatura Digital - Passo 3 */}
      <QRCodeModal
        open={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        qrCodeValue={`https://trya.com/sign/medical-approval-request/${requestId}`}
        title="Finalize com sua assinatura"
        description="Escaneie o QR code abaixo para continuar sua revisão e assinar digitalmente com segurança."
        qrCodeSize={200}
      />
    </Box>
  );
}