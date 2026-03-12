"use client";

import { Box, Typography, Button, Avatar } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { SummaryPresentation } from "@/shared/types/chat";
import { getPriorityLabel } from "@/shared/constants/manchesterPriority";

// Custom medical icon SVG
const MedicalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.3616 14.0088C12.3616 15.4162 11.763 16.766 10.6973 17.7611C9.63172 18.7563 8.18638 19.3154 6.67935 19.3154C5.17231 19.3154 3.727 18.7563 2.66137 17.7611C1.59574 16.766 0.99707 15.4162 0.99707 14.0088C0.99707 9.49946 5.86395 4.19287 6.67935 4.19287C7.49475 4.19287 12.3616 9.49946 12.3616 14.0088Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.3623 7.57635V4.3472H18.242V16.3759C18.242 17.9995 16.9258 19.3157 15.3021 19.3157C14.5641 19.3157 13.8896 19.0438 13.3732 18.5945C13.3732 18.5945 13.0286 18.2784 12.8666 17.9952" stroke="currentColor" strokeWidth="0.714286" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.2709 0.684265H11.332V4.3466H19.2709V0.684265Z" stroke="currentColor" strokeWidth="0.714286" strokeLinejoin="round"/>
    <path d="M18.2421 7.90845H15.4404V13.1683H18.2421V7.90845Z" stroke="currentColor" strokeWidth="0.714286" strokeLinejoin="round"/>
    <path d="M13.9414 0.676971V4.34683" stroke="currentColor" strokeWidth="0.714286" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.6621 0.676971V4.34683" stroke="currentColor" strokeWidth="0.714286" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.65332 11.0367H8.7074" stroke="currentColor" strokeWidth="0.714286" strokeLinecap="round"/>
    <path d="M6.67969 9.00952V13.0636" stroke="currentColor" strokeWidth="0.714286" strokeLinecap="round"/>
    <path d="M4.65332 15.5126H8.7074" stroke="currentColor" strokeWidth="0.714286" strokeLinecap="round"/>
  </svg>
);

interface SummaryCardProps {
  summaryPresentation: SummaryPresentation;
  timestamp: string;
  onDownload: () => void;
}

/**
 * SummaryCard - Componente de card de resumo da triagem
 * 
 * Layout baseado no design:
 * - Header: "Resumo da sua triagem" + botão "Baixar resumo"
 * - Linha: "Paciente: {nome} | Prioridade: {prioridade} ({descrição})"
 * - Card de sintomas com ícone
 * - Lista de bullet points: histórico, medicamentos, alertas
 * 
 * @requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
 */
export function SummaryCard({
  summaryPresentation,
  timestamp,
  onDownload,
}: SummaryCardProps) {
  const { patient, symptoms, medications, activeHistory, criticalAlerts } = summaryPresentation;

  const hasSymptoms = symptoms && symptoms.length > 0;
  const hasMedications = medications && medications.length > 0;
  const hasActiveHistory = activeHistory && activeHistory.length > 0;
  const hasCriticalAlerts = criticalAlerts && criticalAlerts.length > 0;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: { xs: "10px", md: "12px" },
        p: { xs: 2, md: 3 },
        border: "1px solid",
        borderColor: "divider",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      {/* Header: Título e Botão Baixar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: "16px", md: "18px" },
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          Resumo da sua triagem
        </Typography>
        <Button
          aria-label="Baixar resumo"
          onClick={onDownload}
          variant="contained"
          startIcon={<DownloadIcon />}
          size="small"
        >
          Baixar resumo
        </Button>
      </Box>

      {/* Paciente e Prioridade */}
      <Typography
        sx={{
          fontSize: { xs: "13px", md: "14px" },
          fontWeight: 500,
          color: "text.primary",
          mb: 2,
        }}
      >
        <Box component="span" sx={{ fontWeight: 600 }}>Paciente:</Box> {patient.name} |{" "}
        <Box component="span" sx={{ fontWeight: 600 }}>Prioridade:</Box> {getPriorityLabel(patient.priority)}
        {patient.clinicalDescription && ` (${patient.clinicalDescription})`}
      </Typography>

      {/* Card de Sintomas */}
      {hasSymptoms && (
        <Box
          sx={{
            bgcolor: "grey.50",
            borderRadius: { xs: "8px", md: "10px" },
            p: { xs: 1.5, md: 2 },
            mb: 2,
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "primary.light",
              color: "primary.main",
            }}
          >
            <MedicalIcon />
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "13px", md: "14px" },
                fontWeight: 600,
                color: "text.primary",
                mb: 0.5,
              }}
            >
              Sintomas
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "12px", md: "13px" },
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              {symptoms.join(", ")}.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Lista de informações adicionais */}
      <Box
        component="ul"
        sx={{
          m: 0,
          pl: 2.5,
          listStyleType: "disc",
          "& li": {
            fontSize: { xs: "12px", md: "13px" },
            color: "text.secondary",
            mb: 0.75,
            lineHeight: 1.5,
          },
          "& li:last-child": {
            mb: 0,
          },
        }}
      >
        {hasActiveHistory && (
          <li>
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              Histórico Ativo:
            </Box>{" "}
            {activeHistory.join(", ")}.
          </li>
        )}
        {hasMedications && (
          <li>
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              Medicamentos em Uso:
            </Box>{" "}
            {medications.join(", ")}.
          </li>
        )}
        {hasCriticalAlerts && (
          <li>
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              Alerta Crítico:
            </Box>{" "}
            {criticalAlerts.join(", ")}.
          </li>
        )}
      </Box>

      {/* Disclaimer */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: "rgba(190, 225, 235, 0.3)",
          borderRadius: "8px",
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <WarningAmberIcon sx={{ fontSize: 20, color: "grey.700", mt: 0.25 }} />
        <Box>
          <Typography
            sx={{
              fontSize: { xs: "13px", md: "14px" },
              fontWeight: 600,
              color: "text.primary",
              mb: 0.5,
            }}
          >
            Importante
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "12px", md: "13px" },
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Esta é uma <Box component="span" sx={{ fontWeight: 600 }}>impressão diagnóstica</Box>, não um diagnóstico médico definitivo.
            A inteligência artificial atua como suporte à teletriagem e não substitui a avaliação de um profissional de saúde.
          </Typography>
        </Box>
      </Box>

      {/* Timestamp */}
      {timestamp && (
        <Typography
          sx={{
            fontSize: { xs: "9px", md: "10px" },
            fontWeight: 400,
            color: "grey.600",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          {timestamp} ✓✓
        </Typography>
      )}
    </Box>
  );
}
