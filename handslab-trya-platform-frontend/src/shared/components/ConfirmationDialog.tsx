"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import type { ReactNode } from "react";

export interface ConfirmationDialogAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  disabled?: boolean;
}

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string | ReactNode;
  actions: ConfirmationDialogAction[];
  isLoading?: boolean;
  error?: string | null;
  children?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function ConfirmationDialog({
  open,
  onClose,
  title,
  message,
  actions,
  isLoading = false,
  error = null,
  children,
  maxWidth = "sm",
}: ConfirmationDialogProps) {
  const theme = useThemeColors();

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
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
          fontWeight: 700,
          fontSize: "20px",
          color: theme.textDark,
          pb: 1,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {typeof message === "string" ? (
          <Typography sx={{ color: theme.textMuted, mb: 2 }}>
            {message}
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>{message}</Box>
        )}

        {children}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {actions.map((action, index) => {
          const isActionLoading = isLoading && action.variant === "contained";
          
          return (
            <Button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled || isLoading}
              variant={action.variant || "text"}
              sx={{
                ...(action.variant === "text" && {
                  color: theme.textMuted,
                  textTransform: "none",
                  fontWeight: 500,
                }),
                ...(action.variant === "contained" && {
                  bgcolor: theme.primary,
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": {
                    bgcolor: theme.primary,
                    opacity: 0.9,
                  },
                  "&:disabled": {
                    bgcolor: theme.textMuted,
                    color: "white",
                  },
                }),
              }}
              startIcon={
                isActionLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {action.label}
            </Button>
          );
        })}
      </DialogActions>
    </Dialog>
  );
}
