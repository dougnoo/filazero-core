"use client";

import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import BeneficiaryForm from "./BeneficiaryForm";
import type { Beneficiary } from "../types/beneficiary";
import { useTheme } from "@/shared/hooks/useTheme";

interface BeneficiaryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Beneficiary>) => Promise<void>;
  beneficiary?: Beneficiary | null;
  mode: "add" | "edit";
  companies?: Array<{ id: string; name: string }>;
  healthOperators?: Array<{ id: string; name: string }>;
}

// Ícone de fechar
const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function BeneficiaryModal({
  open,
  onClose,
  onSubmit,
  beneficiary,
  mode,
  companies = [],
  healthOperators = [],
}: BeneficiaryModalProps) {
  const { theme } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reseta o loading quando o modal é aberto ou fechado
  useEffect(() => {
    if (open) {
      // Reseta o loading quando o modal é aberto
      setIsLoading(false);
    } else {
      // Também reseta quando o modal fecha
      setIsLoading(false);
    }
  }, [open]);

  // Reseta o loading quando o modal fecha
  const handleClose = () => {
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (data: Partial<Beneficiary>) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      // Não fecha o modal aqui, deixa o componente pai fazer isso após mostrar o toast
      // O loading será resetado quando o modal fechar
    } catch (error) {
      // Sempre reseta o loading quando há erro
      setIsLoading(false);
      // Re-lança o erro para que o componente pai possa tratá-lo
      throw error;
    }
  };

  const handleSaveClick = () => {
    // Encontra o form dentro do BeneficiaryForm e dispara o submit
    if (contentRef.current) {
      const form = contentRef.current.querySelector("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            boxShadow: "0px 8px 24px rgba(6,36,36,0.12)",
            maxWidth: "600px",
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E5E7EB",
          px: 3,
          py: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "20px",
            color: theme?.colors.text.primary || "#041616",
          }}
        >
          {mode === "add" ? "Novo beneficiário" : "Editar beneficiário"}
        </Typography>
        <IconButton
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            color: "#6B7280",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        ref={contentRef}
        sx={{
          px: 3,
          pt: "32px !important",
          pb: 3,
          position: "relative",
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255, 255, 255, 0.8)",
              zIndex: 1,
              borderRadius: "12px",
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
        <BeneficiaryForm
          beneficiary={beneficiary}
          onSubmit={handleSubmit}
          companies={companies}
          healthOperators={healthOperators}
          mode={mode}
        />
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          borderTop: "1px solid #E5E7EB",
          px: 3,
          py: 2,
          gap: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
          sx={{
            height: 40,
            borderRadius: "8px",
            textTransform: "none",
            borderColor: "#F15923",
            color: "#F15923",
            fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
            fontWeight: 600,
            px: 3,
            lineHeight: 1,
            "&:hover": {
              borderColor: "#D14A1E",
              bgcolor: "rgba(241, 89, 35, 0.04)",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSaveClick}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            height: 40,
            borderRadius: "8px",
            textTransform: "none",
            bgcolor: theme?.colors.button.primary || "#FFC107",
            color: theme?.colors.button.text || "#041616",
            fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
            fontWeight: 600,
            px: 3,
            lineHeight: 1,
            "&:hover": {
              bgcolor: theme?.colors.button.primaryHover || "#FFB300",
            },
            "&:disabled": {
              bgcolor: "rgba(0, 0, 0, 0.12)",
              color: "rgba(0, 0, 0, 0.26)",
            },
          }}
        >
          {isLoading
            ? "Salvando..."
            : mode === "add"
              ? "Salvar beneficiário"
              : "Atualizar beneficiário"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

