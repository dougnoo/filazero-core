"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
} from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { RichTextEditor } from "./RichTextEditor";

interface AdjustmentsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (adjustments: AdjustmentsData) => void;
  initialData?: AdjustmentsData;
}

export interface AdjustmentsData {
  initialInteraction: string;
  iaAnalysis: string;
  examsSubmitted: string;
  recommendations: string;
}

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 5L5 15M5 5L15 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function AdjustmentsModal({
  open,
  onClose,
  onSave,
  initialData,
}: AdjustmentsModalProps) {
  const theme = useThemeColors();
  const [formData, setFormData] = useState<AdjustmentsData>(
    initialData || {
      initialInteraction: "",
      iaAnalysis: "",
      examsSubmitted: "",
      recommendations: "",
    }
  );

  const handleChange = (field: keyof AdjustmentsData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    // O componente pai controlará o fechamento e abertura do próximo modal
  };

  const handleCancel = () => {
    // Resetar para dados iniciais ao cancelar
    if (initialData) {
      setFormData(initialData);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: "white",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          p: 0,
          fontFamily: theme.fontFamily,
          maxHeight: "90vh",
        },
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "white",
          zIndex: 1,
          borderBottom: `1px solid ${theme.softBorder}`,
          p: { xs: 3, md: 4 },
        }}
      >
        {/* Header */}
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={handleCancel}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              color: theme.textMuted,
              "&:hover": {
                bgcolor: theme.backgroundSoft,
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            sx={{
              color: theme.textDark,
              fontWeight: 600,
              fontSize: { xs: "20px", md: "24px" },
              mb: 1,
            }}
          >
            Ajustes na avaliação
          </Typography>

          <Typography
            sx={{
              color: theme.textMuted,
              fontSize: { xs: "13px", md: "14px" },
            }}
          >
            Revise e edite as informações da triagem antes de aprovar
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          overflowY: "auto",
          maxHeight: "calc(90vh - 200px)",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Início da interação */}
          <RichTextEditor
            label="Início da interação"
            value={formData.initialInteraction}
            onChange={(value) => handleChange("initialInteraction", value)}
            placeholder="Descreva como foi o início da interação com o paciente..."
            rows={4}
          />

          {/* Análise inicial da IA */}
          <RichTextEditor
            label="Análise inicial da IA"
            value={formData.iaAnalysis}
            onChange={(value) => handleChange("iaAnalysis", value)}
            placeholder="Descreva a análise realizada pela IA..."
            rows={4}
          />

          {/* Envio de exames */}
          <RichTextEditor
            label="Envio de exames"
            value={formData.examsSubmitted}
            onChange={(value) => handleChange("examsSubmitted", value)}
            placeholder="Descreva os exames enviados e suas observações..."
            rows={4}
          />

          {/* Recomendações */}
          <RichTextEditor
            label="Recomendações"
            value={formData.recommendations}
            onChange={(value) => handleChange("recommendations", value)}
            placeholder="Liste as recomendações para o paciente (uma por linha)..."
            rows={6}
          />
        </Box>
      </Box>

      {/* Footer com Botões */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "white",
          borderTop: `1px solid ${theme.softBorder}`,
          p: { xs: 3, md: 4 },
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="outlined"
          size="large"
          onClick={handleCancel}
          sx={{
            textTransform: "none",
            borderColor: theme.softBorder,
            color: theme.textDark,
            px: 3,
            fontWeight: 500,
            "&:hover": {
              borderColor: theme.textDark,
              bgcolor: "transparent",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          sx={{
            textTransform: "none",
            bgcolor: theme.primary,
            color: "white",
            px: 4,
            fontWeight: 500,
            "&:hover": {
              bgcolor: theme.primary,
              opacity: 0.9,
            },
          }}
        >
          Continuar
        </Button>
      </Box>
    </Dialog>
  );
}

