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

interface ExamRequestsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ExamRequestsData) => void;
  initialData?: ExamRequestsData;
}

export interface ExamRequestsData {
  requestTitle1: string;
  requestDescription1: string;
  observations1: string;
  requestTitle2?: string;
  requestDescription2?: string;
  observations2?: string;
  requestedBy: string;
  requestDate: string;
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

export function ExamRequestsModal({
  open,
  onClose,
  onSave,
  initialData,
}: ExamRequestsModalProps) {
  const theme = useThemeColors();
  const [formData, setFormData] = useState<ExamRequestsData>(
    initialData || {
      requestTitle1: "Solicitação de exame – Hemograma Completo",
      requestDescription1: "Finalidade: Avaliação geral do estado hematológico, contagem de células sanguíneas e triagem de possíveis anemias ou infecções.",
      observations1: "Jejum não obrigatório.\nEvitar atividade física intensa nas 24h anteriores à coleta.",
      requestTitle2: "Solicitação de exame – TSH (Hormônio Tireoestimulante)",
      requestDescription2: "Finalidade: Avaliação da função tireoidiana para investigação de hipo ou hipertireoidismo.",
      observations2: "Jejum não recomendado.\nEvitar uso de suplementos ou medicamentos hormonais nas 48h anteriores, salvo orientação médica.",
      requestedBy: "Dra. Augusto Mello — CRM / MG 77469",
      requestDate: "23/10/2025",
    }
  );

  const handleChange = (field: keyof ExamRequestsData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
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
            Solicitações de exames
          </Typography>

          <Typography
            sx={{
              color: theme.textMuted,
              fontSize: { xs: "13px", md: "14px" },
            }}
          >
            Revise e edite as solicitações de exames antes de finalizar
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Primeira Solicitação */}
          <Box
            sx={{
              p: 3,
              borderRadius: "8px",
              border: `1px solid ${theme.softBorder}`,
              bgcolor: theme.backgroundSoft,
            }}
          >
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 700,
                color: theme.textDark,
                mb: 2,
              }}
            >
              Solicitação 1
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: theme.textDark,
                    mb: 0.5,
                  }}
                >
                  Título
                </Typography>
                <TextField
                  fullWidth
                  value={formData.requestTitle1}
                  onChange={(e) =>
                    handleChange("requestTitle1", e.target.value)
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      fontFamily: theme.fontFamily,
                      borderRadius: "8px",
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: theme.softBorder,
                      },
                      "&:hover fieldset": {
                        borderColor: theme.primary,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.primary,
                      },
                    },
                  }}
                />
              </Box>

              <RichTextEditor
                label="Finalidade"
                value={formData.requestDescription1}
                onChange={(value) => handleChange("requestDescription1", value)}
                rows={3}
              />

              <RichTextEditor
                label="Observações"
                value={formData.observations1}
                onChange={(value) => handleChange("observations1", value)}
                rows={2}
              />
            </Box>
          </Box>

          {/* Segunda Solicitação */}
          <Box
            sx={{
              p: 3,
              borderRadius: "8px",
              border: `1px solid ${theme.softBorder}`,
              bgcolor: theme.backgroundSoft,
            }}
          >
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 700,
                color: theme.textDark,
                mb: 2,
              }}
            >
              Solicitação 2
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: theme.textDark,
                    mb: 0.5,
                  }}
                >
                  Título
                </Typography>
                <TextField
                  fullWidth
                  value={formData.requestTitle2}
                  onChange={(e) =>
                    handleChange("requestTitle2", e.target.value)
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      fontFamily: theme.fontFamily,
                      borderRadius: "8px",
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: theme.softBorder,
                      },
                      "&:hover fieldset": {
                        borderColor: theme.primary,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.primary,
                      },
                    },
                  }}
                />
              </Box>

              <RichTextEditor
                label="Finalidade"
                value={formData.requestDescription2}
                onChange={(value) => handleChange("requestDescription2", value)}
                rows={3}
              />

              <RichTextEditor
                label="Observações"
                value={formData.observations2}
                onChange={(value) => handleChange("observations2", value)}
                rows={2}
              />
            </Box>
          </Box>

          {/* Informações do Solicitante */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: theme.textDark,
              }}
            >
              Solicitante
            </Typography>
            <TextField
              fullWidth
              value={formData.requestedBy}
              onChange={(e) => handleChange("requestedBy", e.target.value)}
              placeholder="Nome do médico — CRM / UF"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "14px",
                  fontFamily: theme.fontFamily,
                  borderRadius: "8px",
                  bgcolor: theme.backgroundSoft,
                  "& fieldset": {
                    borderColor: theme.softBorder,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.primary,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.primary,
                  },
                },
              }}
            />
            <TextField
              fullWidth
              value={formData.requestDate}
              onChange={(e) => handleChange("requestDate", e.target.value)}
              placeholder="DD/MM/AAAA"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "14px",
                  fontFamily: theme.fontFamily,
                  borderRadius: "8px",
                  bgcolor: theme.backgroundSoft,
                  "& fieldset": {
                    borderColor: theme.softBorder,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.primary,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.primary,
                  },
                },
              }}
            />
          </Box>
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
          Enviar sugestões
        </Button>
      </Box>
    </Dialog>
  );
}

