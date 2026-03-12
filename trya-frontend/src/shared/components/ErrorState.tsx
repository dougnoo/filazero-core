'use client';

import { Box, Typography, Button, Alert } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

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
        <Typography sx={{ fontSize: "14px", color: "grey.800" }}>
          {message}
        </Typography>
      </Alert>
      
      {onRetry && (
        <Button
          variant={variant}
          size={size}
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          Tentar novamente
        </Button>
      )}
    </Box>
  );
}