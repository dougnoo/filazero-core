"use client";

import { Box, Typography } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

type ChatStatus = "analyzing" | "waiting" | "completed";

interface ChatHeaderProps {
  title: string;
  status: ChatStatus;
}

export function ChatHeader({ title, status }: ChatHeaderProps) {
  const theme = useThemeColors();
  
  const STATUS_CONFIG: Record<ChatStatus, { label: string; dot: string }> = {
    analyzing: { label: "Analisando", dot: theme.successSoft },
    waiting: { label: "Online", dot: theme.successSoft },
    completed: { label: "Concluído", dot: theme.primary },
  };
  
  const config = STATUS_CONFIG[status];

  return (
    <Box
      sx={{
        px: { xs: 3, md: 5 },
        py: { xs: 2, md: 3 },
        bgcolor: theme.white,
        borderBottom: `2px solid ${theme.softBorder}`,
      }}
    >
      <Box
        sx={{
          maxWidth: 808,
          mx: "auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: theme.fontFamily,
            fontSize: { xs: 20, md: 24 },
            fontWeight: 600,
            color: theme.textDark,
            letterSpacing: "-0.4px",
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: config.dot }} />
          <Typography
            sx={{
              fontFamily: theme.fontFamily,
              fontSize: 14,
              fontWeight: 400,
              color: theme.textMuted,
            }}
          >
            {config.label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
