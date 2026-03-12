import { useState } from "react";
import { medicalApprovalRequestsService } from "@/shared/services/medicalApprovalRequestsService";
import type { AttachmentDetails } from "../../../types";

interface UseAttachmentDownloadReturn {
  downloadAttachmentFromDetails: (attachment: AttachmentDetails) => Promise<void>;
  downloading: boolean;
  error: string | null;
}

/**
 * Hook para gerenciar o download de anexos de uma Medical Approval Request
 */
export function useAttachmentDownload(requestId: string): UseAttachmentDownloadReturn {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadAttachmentFromDetails = async (attachment: AttachmentDetails) => {
    try {
      setDownloading(true);
      setError(null);

      // Obter URL de download da API
      const response = await medicalApprovalRequestsService.getAttachmentDownloadUrl(
        requestId,
        attachment.id
      );

      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = response.url;
      link.download = attachment.originalName || response.fileName; // Usar fileName passado ou o da resposta
      link.target = '_blank';
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer download do anexo";
      setError(errorMessage);
      console.error("Erro ao fazer download do anexo:", err);
    } finally {
      setDownloading(false);
    }
  };

  return {
    downloadAttachmentFromDetails,
    downloading,
    error,
  };
}