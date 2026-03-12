"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useParams } from "next/navigation";
import { certificateService } from "../services/certificate.service";
import type { CertificateDetail, ValidationResult } from "../types/certificate.types";
import BackButton from "@/shared/components/BackButton";
import { FilePreviewDialog } from "@/shared/components/FilePreviewDialog";
import { 
  translateAnalysisStatus, 
  translateValidationResult,
  translateConclusion 
} from "../utils/translations";

// Cores para os status de validação
const VALIDATION_STATUS_STYLES = {
  VALID: {
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    iconColor: "#22C55E",
    icon: CheckCircleOutlineIcon,
  },
  WARNING: {
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
    iconColor: "#F59E0B",
    icon: WarningAmberIcon,
  },
  INVALID: {
    bgColor: "#FEF2F2",
    borderColor: "#FECACA",
    iconColor: "#EF4444",
    icon: ErrorOutlineIcon,
  },
  DEFAULT: {
    bgColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    iconColor: "#6B7280",
    icon: HelpOutlineIcon,
  },
};

// Função para determinar a cor do progress baseado no score
const getProgressColor = (score: number) => {
  if (score >= 80) return "#84CC16"; // Verde lima
  if (score >= 60) return "#F59E0B"; // Amarelo
  return "#EF4444"; // Vermelho
};

// Função para obter o estilo baseado no status
const getValidationStyle = (result: string | undefined | null) => {
  if (!result) return VALIDATION_STATUS_STYLES.DEFAULT;
  
  const status = result.toUpperCase();
  if (status.includes("VALID") && !status.includes("INVALID")) {
    return VALIDATION_STATUS_STYLES.VALID;
  }
  if (status.includes("WARNING")) {
    return VALIDATION_STATUS_STYLES.WARNING;
  }
  if (status.includes("INVALID")) {
    return VALIDATION_STATUS_STYLES.INVALID;
  }
  return VALIDATION_STATUS_STYLES.DEFAULT;
};

// Componente para exibir cada validação
const ValidationBlock = ({
  label,
  validation,
  translateResult = true,
}: {
  label: string;
  validation: ValidationResult | undefined | null;
  translateResult?: boolean;
}) => {
  const style = getValidationStyle(validation?.result);
  const IconComponent = style.icon;

  if (!validation) {
    return (
      <Box
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: 1,
          bgcolor: style.bgColor,
          borderLeft: `3px solid ${style.borderColor}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <IconComponent
            sx={{
              color: style.iconColor,
              fontSize: 20,
              mt: 0.25,
              flexShrink: 0,
            }}
          />
          <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#374151" }}>
            {label}: -
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 1,
        bgcolor: style.bgColor,
        borderLeft: `3px solid ${style.borderColor}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <IconComponent
          sx={{
            color: style.iconColor,
            fontSize: 20,
            mt: 0.25,
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              color: "#374151",
              mb: 0.5,
            }}
          >
            {label}: {translateResult && validation.result ? translateValidationResult(validation.result) : validation.result || "-"}
          </Typography>
          <Typography
            sx={{
              fontSize: "13px",
              color: "#6B7280",
              lineHeight: 1.5,
            }}
          >
            {validation.observation || "-"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default function CertificateDetailPage() {
  const params = useParams();
  const [certificate, setCertificate] = useState<CertificateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const handleMarkAsViewed = async () => {
    if (!certificate || certificate.status !== "PENDING") return;

    try {
      setUpdatingStatus(true);
      const result = await certificateService.updateStatusHR(certificate.id, "VIEWED");
      setCertificate((prev) =>
        prev ? { ...prev, status: result.status, updatedAt: result.updatedAt } : null
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate?.fileUrl) return;

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
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
    } finally {
      setDownloading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "0MB";
    return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  };

  const confidenceScore = certificate.confidenceScore ?? 0;
  const progressColor = getProgressColor(confidenceScore);

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
        {/* Back Button */}
        <BackButton variant="icon-only" />

        {/* Header com informações do beneficiário */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography
                component="h3"
                fontWeight={700}
                fontSize={{ xs: "20px", md: "24px" }}
                sx={{ mb: 0.5 }}
              >
                Resumo da validação do atestado
              </Typography>
              <Typography fontSize={14} color="text.secondary">
                {certificate.beneficiary.name} - Atestado enviado em{" "}
                {formatDate(certificate.createdAt)}
              </Typography>
            </Box>
            {certificate.status === "PENDING" && (
              <Button
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={handleMarkAsViewed}
                disabled={updatingStatus}
              >
                {updatingStatus ? "Atualizando..." : "Marcar como Visualizado"}
              </Button>
            )}
            {certificate.status === "VIEWED" && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  bgcolor: "#DBEAFE",
                  borderRadius: 1,
                }}
              >
                <VisibilityIcon sx={{ color: "#3B82F6", fontSize: 20 }} />
                <Typography sx={{ color: "#3B82F6", fontWeight: 500, fontSize: 14 }}>
                  Visualizado
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Score de Confiança com Accordion */}
        <Accordion
          expanded={accordionExpanded}
          onChange={() => setAccordionExpanded(!accordionExpanded)}
          elevation={0}
          sx={{
            border: "none",
            "&:before": { display: "none" },
            mb: 3,
          }}
        >
          <AccordionSummary
            expandIcon={
              <Tooltip title={accordionExpanded ? "Ocultar detalhes" : "Ver detalhes da análise"}>
                <Box component="span" sx={{ display: "flex", p: 0.5 }}>
                  <ExpandMoreIcon />
                </Box>
              </Tooltip>
            }
            sx={{
              px: 0,
              minHeight: "auto",
              alignItems: "flex-start",
              "& .MuiAccordionSummary-expandIconWrapper": {
                mt: 0.5,
              },
              "& .MuiAccordionSummary-content": {
                my: 1,
                flexDirection: "column",
                gap: 1.5,
                mr: 1,
              },
            }}
          >
            <Typography fontWeight={500}>
              Score de confiança da IA: {confidenceScore.toFixed(0)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={confidenceScore}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: "#E5E7EB",
                width: "100%",
                "& .MuiLinearProgress-bar": {
                  bgcolor: progressColor,
                  borderRadius: 5,
                },
              }}
            />
            <Typography
              sx={{
                fontSize: "12px",
                color: "primary.main",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {accordionExpanded ? "Ocultar detalhes" : "Ver detalhes da análise"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 2 }}>
            {/* Resultado da análise automática */}
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                mb: 2,
              }}
            >
              Resultado da análise automática
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ mb: 0.5 }}>
                <strong>Status da análise:</strong> {translateAnalysisStatus(certificate.analysisStatus)}
              </Typography>
              <Typography sx={{ mb: 0.5 }}>
                <strong>Confiança:</strong> {confidenceScore.toFixed(0)}%
              </Typography>
              <Typography sx={{ mb: 2 }}>
                <strong>Conclusão da IA:</strong> {translateConclusion(certificate.aiConclusion)}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                mb: 2,
              }}
            >
              Validações:
            </Typography>
            <Box>
              <ValidationBlock label="CRM" validation={certificate.validations.crm} />
              <ValidationBlock label="Autenticidade" validation={certificate.validations.authenticity} />
              <ValidationBlock label="Assinatura" validation={certificate.validations.signature} />
              <ValidationBlock label="Data" validation={certificate.validations.date} />
              <ValidationBlock label="Legibilidade" validation={certificate.validations.legibility} />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Observações do beneficiário */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              mb: 2,
            }}
          >
            Observações do beneficiário
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Typography fontStyle={certificate.observations ? "normal" : "italic"}>
            {certificate.observations || "Não incluída."}
          </Typography>
        </Box>

        {/* Anexos */}
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              mb: 2,
            }}
          >
            Anexos
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: "#F3F4F6",
              borderRadius: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "14px" }}>
                {certificate.fileName} ·
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "primary.main",
                  ":hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={() => setPreviewOpen(true)}
              >
                Visualizar
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontSize: "14px", color: "text.secondary" }}>
                {formatFileSize(certificate.fileSize)}
              </Typography>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                variant="outlined"
                size="small"
                sx={{
                  textTransform: "none",
                  borderColor: "#D1D5DB",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "#9CA3AF",
                    bgcolor: "transparent",
                  },
                }}
              >
                {downloading ? "Baixando..." : "Baixar"}
              </Button>
            </Box>
          </Box>
        </Box>

        <FilePreviewDialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fileUrl={certificate.fileUrl || ""}
          fileName={certificate.fileName}
        />
      </Paper>
    </Box>
  );
}
