"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { certificateService } from "../services/certificateService";
import type { CertificateDetail } from "../types/certificate.types";
import { PatientCard } from "../../components/PatientCard";
import { PatientHistoryCard } from "../../components/PatientHistoryCard";
import { getUrlWithTenant } from "@/shared/utils/tenantUtils";
import { FilePreviewDialog } from "@/shared/components/FilePreviewDialog";
import BackButton from "@/shared/components/BackButton";

// Ícone de Voltar
const BackIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.57 5.93005L3.5 12.0001L9.57 18.0701"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.5 12.0001H3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Ícone de Documento
const DocumentIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2V8H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CertificateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { tenant: tenantName } = useTenantAssets();
  const certificateId = params.id as string;

  const [certificate, setCertificate] = useState<CertificateDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Buscar detalhes do atestado
  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await certificateService.getById(certificateId);
        setCertificate(data);
      } catch (err) {
        setError("Erro ao carregar detalhes do atestado.");
        console.error("Erro ao buscar atestado:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificate();
  }, [certificateId]);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "0B";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !certificate) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Atestado não encontrado"}</Alert>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: { xs: 3, md: 3, lg: 4 },
        width: "100%",
        height: { xs: "auto", lg: "calc(100vh - 64px)" },
        minHeight: 0,
        maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Sidebar Esquerda */}
      <Box
        sx={{
          width: { xs: "100%", lg: 320 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, md: 3 },
          height: { xs: "auto", lg: "calc(100vh - 64px)" },
          minHeight: 0,
          maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
          overflowY: { xs: "visible", lg: "auto" },
          overflowX: "hidden",
          pr: { lg: 1 },
          pb: { lg: 2 },
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#9CA3AF",
            borderRadius: "3px",
            "&:hover": {
              bgcolor: "#6B7280",
            },
          },
        }}
      >
        <BackButton />
        <PatientCard />
        <PatientHistoryCard />
      </Box>

      {/* Conteúdo Principal */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#9CA3AF",
            borderRadius: "3px",
            "&:hover": {
              bgcolor: "#6B7280",
            },
          },
        }}
      >
        {/* Conteúdo sem boxes - apenas separadores */}
        <Box
          sx={{
            pb: 3,
            bgcolor: "background.paper",
            borderRadius: "8px",
            p: { xs: 3, md: 4 },
          }}
        >
          {/* Resumo da Validação */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: "18px", md: "20px" },
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Resumo da validação do atestado
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "13px", md: "14px" }
                  }}
                  color="grey.700"
                >
                  Atestado enviado em {formatDate(certificate.createdAt)}
                </Typography>
              </Box>             
            </Box>
          </Box>

            {/* Separador */}
          <Box
            sx={{
              height: "1px",
              bgcolor: 'divider',
              mb: 4,
            }}
          />

          {/* Dados enviados pelo usuário */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontSize: { xs: "15px", md: "16px" },
                fontWeight: 600,
                mb: 1,
              }}
            >
              Atestado médico
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "13px", md: "14px" },
                color: 'grey.800',
                whiteSpace: "pre-line",
              }}
            >
              Observação:{" "}
              <Box
                component="span"
              >
                {certificate.observations?.trim() || "Observação não informada."}
              </Box>
            </Typography>
          </Box>

          {/* Separador */}
          <Box
            sx={{
              height: "1px",
              bgcolor: "divider",
              mb: 4,
            }}
          />

          {/* Anexos */}
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "16px", md: "18px" },
                fontWeight: 600,
                mb: 3,
              }}
            >
              Anexos
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "14px", md: "15px" },
                fontWeight: 500,
                mb: 2,
              }}
            >
              Atestado original
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: { xs: "wrap", sm: "nowrap" },
                bgcolor: "background.default",
                borderRadius: "8px",
                p: 1,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <DocumentIcon />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, alignContent: 'center' }}>
                <Typography
                  sx={{
                    fontSize: { xs: "13px", md: "14px" },
                    fontWeight: 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {certificate.fileName} - {formatFileSize(certificate.fileSize)}
                </Typography>
              </Box>
              <Button
                onClick={() => setPreviewOpen(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 400,
                  fontSize: "13px",
                  minWidth: "auto",
                  "&:hover": {
                    bgcolor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                Visualizar
              </Button>
              <Button
              variant="outlined"
              size="small"
              disabled={downloading}
                onClick={async () => {
                  if (certificate.fileUrl) {
                    try {
                      setDownloading(true);
                      const response = await fetch(certificate.fileUrl);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = certificate.fileName || "atestado.pdf";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error("Erro ao baixar arquivo:", err);
                    } finally {
                      setDownloading(false);
                    }
                  }
                }}
              >
                {downloading ? "Baixando..." : "Baixar"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <FilePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={certificate.fileUrl || ""}
        fileName={certificate.fileName}
      />
    </Box>
  );
}
