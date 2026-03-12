"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Button,
} from "@mui/material";

interface MemedDialogProps {
  open: boolean;
  onClose: () => void;
  isLoading?: boolean;
  patientName?: string;
}

// Close Icon
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

export function MemedDialog({ open, onClose, isLoading = false, patientName }: MemedDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [memedLoaded, setMemedLoaded] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Reset loaded state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setMemedLoaded(false);
      setShowConfirmDialog(false);
    }
  }, [open]);

  // Set up global callback for when Memed module is shown
  useEffect(() => {
    if (open) {
      (window as any).onMemedModuleShown = () => {
        setMemedLoaded(true);
      };
    }

    return () => {
      if ((window as any).onMemedModuleShown) {
        delete (window as any).onMemedModuleShown;
      }
    };
  }, [open]);

  const handleCloseAttempt = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    setMemedLoaded(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {}} // Disable closing on backdrop click
        disableEscapeKeyDown // Disable closing on ESC key
        maxWidth={false}
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              boxShadow: "0px 8px 24px rgba(6,36,36,0.12)",
              width: "90vw",
              height: "90vh",
              maxWidth: "1200px",
              maxHeight: "900px",
              minWidth: "820px",
              minHeight: "700px",
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
            minHeight: "64px",
          }}
        >
          <Typography fontSize={20} fontWeight={700}>
            Prescrição Médica{patientName ? ` - ${patientName}` : ""}
          </Typography>
          <IconButton
            onClick={handleCloseAttempt}
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
            px: 0,
            py: 0,
            position: "relative",
            height: "calc(100% - 64px)", // Subtract header height
            overflow: "hidden",
          }}
        >
          {/* Loading overlay */}
          {(isLoading || !memedLoaded) && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255, 255, 255, 0.9)",
                zIndex: 1,
              }}
            >
              <CircularProgress size={40} />
              <Typography
                sx={{
                  mt: 2,
                  color: 'grey.800',
                  fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                }}
              >
                Carregando prescrição médica...
              </Typography>
            </Box>
          )}

          {/* Memed container */}
          <Box
            ref={containerRef}
            id="memed-prescription-container"
            sx={{
              width: "100%",
              height: "100%!important",
              minWidth: "820px",
              minHeight: "700px",
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              p: 1,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            pb: 1,
          }}
        >
          Fechar prescrição?
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
              fontSize: "14px",
              mb: 3,
              color: 'grey.800'
            }}
          >
            Tem certeza que deseja fechar a prescrição? Certifique-se de que salvou todas as alterações.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              onClick={handleCancelClose}
              variant="outlined"
              color="error"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmClose}
              variant="contained"
            >
              Sim, fechar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}