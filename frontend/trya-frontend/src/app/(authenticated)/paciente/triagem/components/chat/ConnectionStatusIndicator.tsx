"use client";

import { Box, Typography } from "@mui/material";
import { CONNECTION_STATUS, type ConnectionStatus } from "@/shared/types/chat";

// Constantes de cores e labels por status
const CONNECTION_STATUS_CONFIG = {
  [CONNECTION_STATUS.CONNECTED]: {
    color: '#4CAF50',
    label: 'Conectado',
    showAnimation: false
  },
  [CONNECTION_STATUS.DISCONNECTED]: {
    color: '#F44336',
    label: 'Desconectado',
    showAnimation: false
  },
  [CONNECTION_STATUS.RECONNECTING]: {
    color: '#FFC107',
    label: 'Reconectando...',
    showAnimation: true
  }
} as const;

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
}

/**
 * ConnectionStatusIndicator - Badge visual para status de conexão
 * 
 * Exibe um indicador visual do status de conexão do socket:
 * - Conectado: Badge verde
 * - Desconectado: Badge vermelho
 * - Reconectando: Badge amarelo com animação de pulse
 * 
 * @requirements 13.1, 13.2, 13.3, 13.4
 */
export function ConnectionStatusIndicator({ status }: ConnectionStatusIndicatorProps) {
  const config = CONNECTION_STATUS_CONFIG[status];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
      role="status"
      aria-live="polite"
      aria-label={`Status de conexão: ${config.label}`}
    >
      {/* Badge dot with optional pulse animation */}
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: config.color,
          flexShrink: 0,
          ...(config.showAnimation && {
            animation: "pulse 1.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": {
                transform: "scale(1)",
                opacity: 1,
              },
              "50%": {
                transform: "scale(1.3)",
                opacity: 0.7,
              },
              "100%": {
                transform: "scale(1)",
                opacity: 1,
              },
            },
          }),
        }}
      />
      
      {/* Status label */}
      <Typography
        sx={{
          fontSize: { xs: 11, md: 14 },
          fontWeight: 400,
          color: "grey.800",
          lineHeight: 1,
        }}
      >
        {config.label}
      </Typography>
    </Box>
  );
}
