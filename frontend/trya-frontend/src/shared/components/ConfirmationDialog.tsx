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
          <Typography sx={{ color: "grey.800", mb: 2 }}>
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
              color={action.color || (action.variant === "contained" ? "primary" : undefined)}
              sx={{
                textTransform: "none",
                fontWeight: action.variant === "contained" ? 600 : 500,
                ...(action.variant === "text" && {
                  color: "grey.800",
                }),
                ...(action.variant === "contained" && {
                  px: 3,
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
