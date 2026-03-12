'use client';

import { Box, Typography, Button, Alert } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'contained' | 'outlined';
  size?: 'small' | 'medium' | 'large';
}

export function ErrorState({ 
  title = "Erro ao carregar dados",
  message, 
  onRetry,
  variant = 'outlined',
  size = 'medium'
}: ErrorStateProps) {
  const theme = useThemeColors();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <Alert 
        severity="error" 
        sx={{ 
          width: "100%", 
          maxWidth: 400,
          mb: onRetry ? 3 : 0,
          "& .MuiAlert-message": {
            width: "100%",
          }
        }}
      >
        <Typography sx={{ fontWeight: 500, mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "14px", color: theme.textMuted }}>
          {message}
        </Typography>
      </Alert>
      
      {onRetry && (
        <Button
          variant={variant}
          size={size}
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{
            textTransform: "none",
            ...(variant === 'outlined' ? {
              borderColor: theme.primary,
              color: theme.primary,
              "&:hover": {
                borderColor: theme.primary,
                bgcolor: `${theme.primary}08`,
              },
            } : {
              bgcolor: theme.primary,
              color: "white",
              "&:hover": {
                bgcolor: theme.primary,
                opacity: 0.9,
              },
            }),
            px: variant === 'contained' ? 4 : 2,
          }}
        >
          Tentar novamente
        </Button>
      )}
    </Box>
  );
}