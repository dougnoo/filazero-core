"use client";

import { Box, Button, Typography } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

interface TopicButtonProps {
  question: string;
  onClick: () => void;
}

export function TopicButton({ question, onClick }: TopicButtonProps) {
  const theme = useThemeColors();

  return (
    <Button
      onClick={onClick}
      fullWidth
      sx={{
        bgcolor: "#E3F2FD",
        color: theme.textDark,
        textTransform: "none",
        borderRadius: "8px",
        py: 2,
        px: 3,
        justifyContent: "flex-start",
        textAlign: "left",
        fontSize: "14px",
        fontFamily: theme.fontFamily,
        fontWeight: 400,
        border: "none",
        boxShadow: "none",
        "&:hover": {
          bgcolor: "#BBDEFB",
          boxShadow: "none",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: "14px",
          color: theme.textDark,
          fontFamily: theme.fontFamily,
          fontWeight: 400,
          lineHeight: "20px",
          textAlign: "left",
        }}
      >
        {question}
      </Typography>
    </Button>
  );
}

