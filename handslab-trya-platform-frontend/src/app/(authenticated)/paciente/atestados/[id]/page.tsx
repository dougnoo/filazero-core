"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Box, Typography, Button, CircularProgress, Alert, Chip } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useTheme } from "@/shared/hooks/useTheme";
import { certificateService } from "../services/certificateService";
import type { CertificateDetail } from "../types/certificate.types";
import { ValidationResult, getCertificateStatusConfig, CertificateStatus } from "../types/certificate.types";
import { PatientCard, PatientData } from "../../components/PatientCard";
import { PatientHistoryCard } from "../../components/PatientHistoryCard";
import { api } from "@/shared/services/api";
import { getUrlWithTenant } from "@/shared/utils/tenantUtils";

// Ícone de Voltar
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

// Ícone de Check (verde)
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 6L9 17L4 12"
      stroke="#2E7D32"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Ícone de Warning (amarelo)
const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Ícone de X (vermelho)
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="#C62828"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Ícone de Documento
const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function CertificateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useThemeColors();
  const { theme: currentTheme, currentTheme: tenantName } = useTheme();
  const isDefaultTheme = currentTheme?.id === 'default';
  const certificateId = params.id as string;

  const [certificate, setCertificate] = useState<CertificateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(true);

  // Buscar dados do paciente
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoadingPatientData(true);
        const data = await api.get<PatientData>("/api/auth/me", "Erro ao buscar dados do paciente");
        setPatientData(data);
      } catch (error) {
        console.error("Erro ao buscar dados do paciente:", error);
      } finally {
        setIsLoadingPatientData(false);
      }
    };
    fetchPatientData();
  }, []);

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

  const getValidationIcon = (result: ValidationResult | string | undefined) => {
    switch (result) {
      case ValidationResult.VALID:
        return <CheckIcon />;
      case ValidationResult.WARNING:
        return <WarningIcon />;
      case ValidationResult.INVALID:
        return <XIcon />;
      default:
        return null;
    }
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
        <CircularProgress sx={{ color: theme.primary }} />
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
          order: { xs: 2, lg: 1 },
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
        <PatientCard patientData={patientData} isLoading={isLoadingPatientData} />
        <PatientHistoryCard patientData={patientData} isLoading={isLoadingPatientData} />
      </Box>

      {/* Conteúdo Principal */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          order: { xs: 1, lg: 2 },
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
        {/* Botão Voltar */}
        <Button
          onClick={() => {
            const urlWithTenant = getUrlWithTenant('/paciente/atestados', tenantName);
            router.push(urlWithTenant);
          }}
          startIcon={<BackIcon />}
          sx={{
            alignSelf: "flex-start",
            textTransform: "none",
            color: theme.textDark,
            fontWeight: 600,
            fontSize: "14px",
            mb: 2,
            "&:hover": {
              bgcolor: "transparent",
              textDecoration: "underline",
            },
          }}
        >
          Voltar
        </Button>

        {/* Resumo da Validação */}
        <Box
          sx={{
            bgcolor: theme.cardBackground,
            borderRadius: "8px",
            border: `1px solid ${theme.softBorder}`,
            p: { xs: 3, md: 4 },
            mb: 3,
          }}
        >
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
                  color: theme.textDark,
                  mb: 0.5,
                }}
              >
                Resumo da validação do atestado
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "13px", md: "14px" },
                  color: theme.textMuted,
                }}
              >
                Atestado enviado em {formatDate(certificate.createdAt)}
              </Typography>
            </Box>
            <Chip
              label={getCertificateStatusConfig(certificate.status as CertificateStatus).label}
              sx={{
                bgcolor: getCertificateStatusConfig(certificate.status as CertificateStatus).bgcolor,
                color: getCertificateStatusConfig(certificate.status as CertificateStatus).color,
                fontWeight: 500,
                fontSize: "13px",
              }}
            />
          </Box>

          {/* Score de Confiança */}
          {certificate.confidenceScore !== undefined && (
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: { xs: "14px", md: "15px" },
                  fontWeight: 500,
                  color: theme.textDark,
                  mb: 1.5,
                }}
              >
                Score de confiança da IA: {certificate.confidenceScore}%
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 8,
                  bgcolor: theme.backgroundSoft,
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${certificate.confidenceScore}%`,
                    height: "100%",
                    bgcolor: "#2E7D32",
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Resultado da Validação Automática */}
        <Box
          sx={{
            bgcolor: theme.cardBackground,
            borderRadius: "8px",
            border: `1px solid ${theme.softBorder}`,
            p: { xs: 3, md: 4 },
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "18px" },
              fontWeight: 600,
              color: theme.textDark,
              mb: 2,
            }}
          >
            Resultado da validação automática
          </Typography>

          {/* Conclusão da IA */}
          {certificate.aiConclusion && (
            <Typography
              sx={{
                fontSize: { xs: "13px", md: "14px" },
                color: theme.textMuted,
                mb: 3,
              }}
            >
              Conclusão da IA: {certificate.aiConclusion}
            </Typography>
          )}

          {/* Tabela de Validações */}
          {certificate.validations && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(certificate.validations).map(([key, validation]) => {
                if (!validation || !validation.result) return null;
                const labels: Record<string, string> = {
                  crm: "CRM válido",
                  authenticity: "Autenticidade do documento",
                  signature: "Assinatura / QR Code",
                  date: "Coerência das datas",
                  legibility: "Legibilidade do arquivo",
                  clinic: "Clínica registrada",
                  fraud: "Suspeita de fraude",
                };

                return (
                  <Box
                    key={key}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      p: 2,
                      borderRadius: "8px",
                      bgcolor: isDefaultTheme ? theme.chipBackground : theme.backgroundSoft,
                    }}
                  >
                    <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                      {getValidationIcon(validation.result)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: { xs: "13px", md: "14px" },
                          fontWeight: 500,
                          color: theme.textDark,
                          mb: 0.5,
                        }}
                      >
                        {labels[key] || key}
                      </Typography>
                      {validation.observation && (
                        <Typography
                          sx={{
                            fontSize: { xs: "12px", md: "13px" },
                            color: theme.textMuted,
                          }}
                        >
                          {validation.observation}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Anexos */}
        <Box
          sx={{
            bgcolor: theme.cardBackground,
            borderRadius: "8px",
            border: `1px solid ${theme.softBorder}`,
            p: { xs: 3, md: 4 },
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "18px" },
              fontWeight: 600,
              color: theme.textDark,
              mb: 3,
            }}
          >
            Anexos
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              borderRadius: "8px",
              bgcolor: isDefaultTheme ? theme.chipBackground : theme.backgroundSoft,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "8px",
                bgcolor: isDefaultTheme ? theme.chipBackground : theme.iconBackground,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.primary,
              }}
            >
              <DocumentIcon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: { xs: "13px", md: "14px" },
                  fontWeight: 500,
                  color: theme.textDark,
                  mb: 0.5,
                }}
              >
                Atestado original
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "12px", md: "13px" },
                  color: theme.textMuted,
                }}
              >
                {certificate.fileName.replace(/\.[^/.]+$/, "")}
              </Typography>
            </Box>
            <Button
              onClick={() => {
                if (certificate.fileUrl) {
                  window.open(certificate.fileUrl, "_blank");
                }
              }}
              sx={{
                textTransform: "none",
                color: theme.primary,
                fontWeight: 500,
                fontSize: "13px",
                "&:hover": {
                  bgcolor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              Visualizar
            </Button>
            <Typography
              sx={{
                fontSize: { xs: "12px", md: "13px" },
                color: theme.textMuted,
                minWidth: 60,
                textAlign: "right",
              }}
            >
              {formatFileSize(certificate.fileSize)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

