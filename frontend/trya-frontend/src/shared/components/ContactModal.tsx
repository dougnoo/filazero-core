"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import { useToast } from "@/shared/context/ToastContext";
import { contactService } from "@/shared/services/contactService";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
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

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const { showSuccess, showError } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>(
    {}
  );

  const validateForm = (): boolean => {
    const newErrors: { subject?: string; message?: string } = {};

    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedSubject) {
      newErrors.subject = "Assunto é obrigatório";
    } else if (trimmedSubject.length < 3) {
      newErrors.subject = "Assunto deve ter pelo menos 3 caracteres";
    } else if (trimmedSubject.length > 120) {
      newErrors.subject = "Assunto deve ter no máximo 120 caracteres";
    }

    if (!trimmedMessage) {
      newErrors.message = "Mensagem é obrigatória";
    } else if (trimmedMessage.length < 10) {
      newErrors.message = "Mensagem deve ter pelo menos 10 caracteres";
    } else if (trimmedMessage.length > 2000) {
      newErrors.message = "Mensagem deve ter no máximo 2000 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await contactService.sendMessage({
        subject: subject.trim(),
        message: message.trim(),
      });
      showSuccess("Mensagem enviada com sucesso!");
      handleClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao enviar mensagem";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setSubject("");
    setMessage("");
    setErrors({});
    onClose();
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
          alignItems: "flex-start",
          borderBottom: "1px solid #E5E7EB",
          px: 3,
          py: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "20px",
            }}
          >
            Fale com a Trya
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
              fontSize: "14px",
              color: "grey.800",
              mt: 0.5,
            }}
          >
            Envie sua dúvida, solicitação ou feedback.
          </Typography>
        </Box>
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
        sx={{
          px: 3,
          pt: "24px !important",
          pb: 3,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Assunto"
            placeholder="Ex.: Dúvida, problema técnico, sugestão"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) {
                setErrors((prev) => ({ ...prev, subject: undefined }));
              }
            }}
            error={!!errors.subject}
            helperText={errors.subject}
            disabled={isLoading}
            fullWidth
            variant="outlined"
            inputProps={{ maxLength: 120 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />

          <TextField
            label="Mensagem"
            placeholder="Descreva o que você precisa"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) {
                setErrors((prev) => ({ ...prev, message: undefined }));
              }
            }}
            error={!!errors.message}
            helperText={
              errors.message || `${message.length}/2000 caracteres`
            }
            disabled={isLoading}
            fullWidth
            multiline
            rows={5}
            variant="outlined"
            inputProps={{ maxLength: 2000 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #E5E7EB",
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isLoading}
          variant="outlined"
          color="error"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="contained"          
        >
          {isLoading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Enviar mensagem"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
