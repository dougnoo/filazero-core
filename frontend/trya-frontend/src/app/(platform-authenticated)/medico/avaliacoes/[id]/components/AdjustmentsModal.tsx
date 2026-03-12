"use client";

import { useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface AdjustmentsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (doctorNotes: string) => void;
  initialNotes?: string;
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
  initialNotes = "",
}: AdjustmentsModalProps) {
  const [doctorNotes, setDoctorNotes] = useState(initialNotes);

  const handleSave = () => {
    onSave(doctorNotes);
  };

  const handleCancel = () => {
    setDoctorNotes(initialNotes);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            bgcolor: "white",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            p: 0,
             
            maxHeight: "90vh",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "white",
          zIndex: 1,
          borderBottom: 1,
          borderColor: "divider",
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
              color: "grey.800",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            sx={{
               
              fontWeight: 600,
              fontSize: { xs: "20px", md: "24px" },
              mb: 1,
            }}
          >
            Notas do médico
          </Typography>

          <Typography
            sx={{
              color: "grey.800",
              fontSize: { xs: "13px", md: "14px" },
            }}
          >
            Adicione suas observações e recomendações para o paciente
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
        <TextField
          label="Notas do médico"
          multiline
          rows={8}
          fullWidth
          value={doctorNotes}
          onChange={(e) => setDoctorNotes(e.target.value)}
          placeholder="Adicione suas observações, diagnóstico e recomendações para o paciente..."
        />
      </Box>

      {/* Footer com Botões */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "white",
          borderTop: 1,
          borderColor: "divider",
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
          color="error"
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={handleSave}
        >
          Salvar notas
        </Button>
      </Box>
    </Dialog>
  );
}

