"use client";

import { Dialog, Box, Typography, IconButton } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import QRCode from "react-qr-code";
import { ReactNode } from "react";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  qrCodeValue: string;
  title: string;
  description: string;
  qrCodeSize?: number;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  additionalContent?: ReactNode;
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

export function QRCodeModal({ 
  open, 
  onClose,
  qrCodeValue,
  title,
  description,
  qrCodeSize = 200,
  maxWidth = "sm",
  additionalContent,
}: QRCodeModalProps) {
  const theme = useThemeColors();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: "white",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          p: 0,
          fontFamily: theme.fontFamily,
        },
      }}
    >
      <Box sx={{ position: "relative", p: { xs: 3, md: 4 } }}>
        {/* Botão Fechar */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: { xs: 16, md: 20 },
            right: { xs: 16, md: 20 },
            color: theme.textMuted,
            "&:hover": {
              bgcolor: theme.backgroundSoft,
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Título */}
        <Typography
          sx={{
            color: theme.textDark,
            fontWeight: 600,
            fontSize: { xs: "20px", md: "24px" },
            mb: 1,
            textAlign: "center",
          }}
        >
          {title}
        </Typography>
        
        <Typography
          sx={{
            color: theme.textMuted,
            fontSize: { xs: "14px", md: "16px" },
            mb: 4,
            textAlign: "center",
          }}
        >
          {description}
        </Typography>

        {/* QR Code */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: additionalContent ? 3 : 4,
          }}
        >
          <QRCode
            value={qrCodeValue}
            size={qrCodeSize}
            style={{
              height: "auto",
              maxWidth: `${qrCodeSize}px`,
              width: `${qrCodeSize}px`,
            }}
            level="M"
          />
        </Box>

        {/* Conteúdo Adicional Opcional */}
        {additionalContent && (
          <Box sx={{ mb: 2 }}>
            {additionalContent}
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

