"use client";

import { Box, Typography, Avatar } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

interface ChatMessageProps {
  message: string;
  sender: "bot" | "user";
  timestamp: string;
  avatar?: string;
  userName?: string;
  isTyping?: boolean;
}

export function ChatMessage({ message, sender, timestamp, avatar, userName, isTyping = false }: ChatMessageProps) {
  const theme = useThemeColors();
  const isBot = sender === "bot";
  const isUser = sender === "user";
  
  // Gera iniciais do nome do usuário
  const getUserInitials = () => {
    if (userName) {
      return userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    return 'U';
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 2,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      {/* Avatar */}
      <Avatar
        src={avatar}
        sx={{
          width: 40,
          height: 40,
          bgcolor: isBot ? "#FFFFFF" : theme.avatarBackground,
          color: isBot ? theme.textDark : theme.primary,
          fontSize: "14px",
          fontWeight: 600,
          border: isBot ? "none" : "none",
          flexShrink: 0,
          fontFamily: theme.fontFamily,
        }}
      >
        {isBot ? "🤖" : getUserInitials()}
      </Avatar>

      {/* Message Content */}
      <Box
        sx={{
          flex: 1,
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            bgcolor: isBot ? "#FFFFFF" : theme.backgroundSoft,
            borderRadius: "12px",
            p: 2,
            border: "1px solid",
            borderColor: isBot ? theme.softBorder : theme.softBorder,
            maxWidth: "100%",
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
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "rgba(4, 22, 22, 1)",
                    animation: `typingBounce 1.4s ease-in-out ${delay}ms infinite`,
                    "@keyframes typingBounce": {
                      "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
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
                  fontSize: "14px",
                  fontFamily: theme.fontFamily,
                  fontWeight: 400,
                  color: theme.textDark,
                  lineHeight: "20px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {message}
              </Typography>

              <Typography
                sx={{
                  fontSize: "10px",
                  fontFamily: theme.fontFamily,
                  fontWeight: 400,
                  color: theme.textMuted,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  justifyContent: "flex-end",
                  mt: 1,
                }}
              >
                {timestamp} ✓✓
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

