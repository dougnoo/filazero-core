"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
  documentUrl: string;
  title: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export function DocumentModal({
  open,
  onClose,
  documentUrl,
  title,
  maxWidth = "lg",
  isLoading = false,
}: DocumentModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            width: "90vw",
            maxWidth: "1200px",
            height: "85vh",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
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
            fontWeight: 700,
            fontSize: "20px",
          }}
        >
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#6B7280",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flex: 1,
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              minHeight: "400px",
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        ) : documentUrl ? (
          <Box
            component="iframe"
            src={documentUrl}
            sx={{
              width: "100%",
              height: "100%",
              border: "none",
              flex: 1,
            }}
            title={title}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              minHeight: "400px",
            }}
          >
            <Typography
              sx={{
                opacity: 0.6,
              }}
            >
              Documento não disponível
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
