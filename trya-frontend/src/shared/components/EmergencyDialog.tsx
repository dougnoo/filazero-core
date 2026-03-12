"use client";

import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface EmergencyDialogProps {
  open: boolean;
  onClose: () => void;
}

export function EmergencyDialog({ open, onClose }: EmergencyDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningAmberIcon sx={{ color: "#DC2626", fontSize: 28 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "18px" }}>
              Emergência Médica
            </Typography>
            <Typography sx={{ color: "grey.600", fontSize: "14px" }}>
              SAMU - 192
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography sx={{ mb: 3, color: "grey.700", lineHeight: 1.6 }}>
            Em caso de emergência médica, ligue imediatamente para o SAMU (192)
            usando seu celular. O serviço funciona 24 horas.
          </Typography>

          <Box
            sx={{
              bgcolor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "12px",
              p: 3,
              textAlign: "center",
              mb: 3,
            }}
          >
            <Typography sx={{ color: "grey.600", fontSize: "14px", mb: 1 }}>
              Número de Emergência
            </Typography>
            <Typography
              sx={{
                color: "#DC2626",
                fontSize: "48px",
                fontWeight: 700,
                letterSpacing: "4px",
              }}
            >
              192
            </Typography>
            <Typography sx={{ color: "grey.600", fontSize: "14px", mt: 1 }}>
              SAMU - Serviço de Atendimento Móvel de Urgência
            </Typography>
          </Box>

          <Typography sx={{ fontWeight: 600, mb: 2 }}>
            Ao ligar, informe:
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0, color: "grey.700" }}>
            <Box component="li" sx={{ mb: 1 }}>Seu nome e telefone</Box>
            <Box component="li" sx={{ mb: 1 }}>Endereço completo com ponto de referência</Box>
            <Box component="li" sx={{ mb: 1 }}>O que está acontecendo (sintomas, situação)</Box>
            <Box component="li" sx={{ mb: 1 }}>Número de vítimas e estado de consciência</Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
