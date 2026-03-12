"use client";

import { Box, Typography } from "@mui/material";

interface ChatMessageProps {
  message: string;
  sender: "bot" | "user" | "doctor";
  timestamp: string;
  isTyping?: boolean;
}

export function ChatMessage({
  message,
  sender,
  timestamp,
  isTyping = false,
}: ChatMessageProps) {
  const isProfessional = sender === "bot" || sender === "doctor";

  return (
    <Box
      sx={{
        bgcolor: isProfessional ? "background.paper" : "action.hover",
        borderRadius: { xs: "10px", md: "12px" },
        p: { xs: 1.5, md: 2 },
        border: "1px solid",
        borderColor: "divider",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      {isTyping ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "rgba(190, 225, 235, 0.5)",
            borderRadius: "16px",
            px: 1,
            py: 0.5,
          }}
        >
          {[0, 150, 300].map((delay) => (
            <Box
              key={delay}
              sx={{
                width: { xs: 6, md: 8 },
                height: { xs: 6, md: 8 },
                borderRadius: "50%",
                backgroundColor: "text.primary",
                animation: `typingBounce 1.4s ease-in-out ${delay}ms infinite`,
                "@keyframes typingBounce": {
                  "0%, 80%, 100%": {
                    transform: "scale(0.6)",
                    opacity: 0.4,
                  },
                  "40%": { transform: "scale(1)", opacity: 1 },
                },
              }}
            />
          ))}
        </Box>
      ) : (
        <>
          <Typography
            sx={{
              fontSize: { xs: "13px", md: "14px" },
              fontWeight: 400,
              lineHeight: { xs: "18px", md: "20px" },
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {message}
          </Typography>

          {timestamp && (
            <Typography
              sx={{
                fontSize: { xs: "9px", md: "10px" },
                fontWeight: 400,
                color: "grey.600",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                justifyContent: "flex-end",
                mt: { xs: 0.5, md: 1 },
              }}
            >
              {timestamp} ✓✓
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
