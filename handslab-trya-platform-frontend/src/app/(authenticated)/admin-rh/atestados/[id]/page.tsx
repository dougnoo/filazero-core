"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { StatusChip } from "@/shared/components/Table/StatusChip";
import { certificateService } from "../services/certificate.service";
import type { CertificateDetail } from "../types/certificate.types";

const STATUS_OPTIONS = [
  { value: "APPROVED", label: "Aprovado" },
  { value: "PENDING", label: "Pendente" },
  { value: "REJECTED", label: "Rejeitado" },
];

const STATUS_COLOR_MAP = {
  APPROVED: { color: "#10B981", bgColor: "#D1FAE5" },
  PENDING: { color: "#F59E0B", bgColor: "#FEF3C7" },
  REJECTED: { color: "#EF4444", bgColor: "#FEE2E2" },
};

export default function CertificateDetailPage() {
  const params = useParams();
  const theme = useThemeColors();
  const [certificate, setCertificate] = useState<CertificateDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificate();
  }, [params.id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getByIdHR(params.id as string);
      setCertificate(data);
    } catch (error) {
      console.error("Erro ao carregar atestado:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!certificate) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Atestado não encontrado</Typography>
      </Box>
    );
  }

  const getStatusLabel = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.label || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + "MB";
  };

  return (
    <Box
      component="main"
      sx={{
        pb: { xs: 6, md: 8 },
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: { xs: 3, md: 4 },
          bgcolor: "white",
          borderRadius: 2,
        }}
      >
        {/* Header */}
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
              component="h1"
              sx={{
                fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "20px", md: "24px" },
                color: theme.textDark,
                mb: 1,
              }}
            >
              Resumo da validação do atestado
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                color: theme.textMuted,
              }}
            >
              {certificate.beneficiary.name} - Atestado enviado em{" "}
              {formatDate(certificate.createdAt)}
            </Typography>
          </Box>
          <StatusChip
            status={certificate.status}
            label={getStatusLabel(certificate.status)}
            colorMap={STATUS_COLOR_MAP}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Beneficiary Information */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              color: theme.textDark,
              mb: 2,
            }}
          >
            Informações do beneficiário
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
              Nome: <strong>{certificate.beneficiary.name}</strong>
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
              CPF: <strong>{certificate.beneficiary.cpf}</strong>
            </Typography>
            {certificate.beneficiary.tenantName && (
              <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
                Empresa: <strong>{certificate.beneficiary.tenantName}</strong>
              </Typography>
            )}
            {certificate.beneficiary.planName && (
              <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
                Plano: <strong>{certificate.beneficiary.planName}</strong>
              </Typography>
            )}
          </Box>
        </Box>

        {/* Analysis Results */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              color: theme.textDark,
              mb: 2,
            }}
          >
            Resultado da análise automática
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: theme.textDark, mb: 0.5 }}>
              <strong>Status da análise:</strong> {certificate.analysisStatus}
            </Typography>
            <Typography sx={{ color: theme.textDark, mb: 0.5 }}>
              <strong>Confiança:</strong>{" "}
              {(certificate.confidenceScore * 100).toFixed(0)}%
            </Typography>
            <Typography sx={{ color: theme.textDark, mb: 2 }}>
              <strong>Conclusão da IA:</strong> {certificate.aiConclusion}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              color: theme.textDark,
              mb: 1,
            }}
          >
            Validações:
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
              <strong>CRM:</strong> {certificate.validations.crm.result} -{" "}
              {certificate.validations.crm.observation}
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
              <strong>Autenticidade:</strong>{" "}
              {certificate.validations.authenticity.result} -{" "}
              {certificate.validations.authenticity.observation}
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
              <strong>Assinatura:</strong>{" "}
              {certificate.validations.signature.result} -{" "}
              {certificate.validations.signature.observation}
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
              <strong>Data:</strong> {certificate.validations.date.result} -{" "}
              {certificate.validations.date.observation}
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
              <strong>Legibilidade:</strong>{" "}
              {certificate.validations.legibility.result} -{" "}
              {certificate.validations.legibility.observation}
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
              <strong>Clínica:</strong> {certificate.validations.clinic.result}{" "}
              - {certificate.validations.clinic.observation}
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: theme.textDark }}>
              <strong>Fraude:</strong> {certificate.validations.fraud.result} -{" "}
              {certificate.validations.fraud.observation}
            </Typography>
          </Box>
        </Box>

        {/* Attachments */}
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              color: theme.textDark,
              mb: 2,
            }}
          >
            Anexos
          </Typography>
          <Paper
            sx={{
              p: 2,
              bgcolor: theme.backgroundSoft,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: `1px solid ${theme.backgroundSoft}`,
              boxShadow: "none",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ color: theme.textMuted, fontSize: "14px" }}>
                {certificate.fileName}
              </Typography>
              <Typography
                sx={{
                  color: theme.primary,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
                onClick={() => window.open(certificate.fileUrl, "_blank")}
              >
                · Visualizar
              </Typography>
            </Box>
            <Typography sx={{ color: theme.textMuted, fontSize: "14px" }}>
              {formatFileSize(certificate.fileSize)}
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
