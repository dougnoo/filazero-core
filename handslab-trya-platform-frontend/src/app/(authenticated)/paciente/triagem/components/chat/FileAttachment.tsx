"use client";

import { Box, Typography } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

interface FileAttachmentProps {
  fileName: string;
  fileSize: string;
  timestamp: string;
  sender: "bot" | "user";
  userName?: string;
  fileType?: string;
  fileUrl?: string;
}

export function FileAttachment({ fileName, fileSize, timestamp, sender, userName, fileType, fileUrl }: FileAttachmentProps) {
  const theme = useThemeColors();
  const isBot = sender === "bot";
  const isUser = sender === "user";
  const isImage = fileType?.startsWith("image/") && fileUrl;
  
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
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: isBot ? "#FFFFFF" : theme.avatarBackground,
          color: isBot ? theme.textDark : theme.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: 600,
          flexShrink: 0,
          fontFamily: theme.fontFamily,
        }}
      >
        {isBot ? "🤖" : getUserInitials()}
      </Box>

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
            bgcolor: isBot ? "#FFF9EC" : theme.backgroundSoft,
            borderRadius: "16px",
            p: 2,
            border: "none",
            maxWidth: "100%",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.97,
            },
          }}
        >
          {isImage ? (
            <Box
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                maxWidth: "100%",
                mb: 1,
              }}
            >
              <Box
                component="img"
                src={fileUrl}
                alt={fileName}
                sx={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "auto",
                  borderRadius: "12px",
                  display: "block",
                }}
              />
              <Box sx={{ mt: 1 }}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontFamily: theme.fontFamily,
                    fontWeight: 600,
                    color: theme.textDark,
                  }}
                >
                  {fileName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontFamily: theme.fontFamily,
                    color: theme.textMuted,
                  }}
                >
                  {fileSize}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                bgcolor: theme.chipBackground, // um pouco mais escuro que backgroundSoft
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1.5,
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: theme.iconBackground,
                }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M28.5716 28.5715C28.5716 29.1777 28.3308 29.759 27.9021 30.1877C27.4734 30.6164 26.8921 30.8572 26.2859 30.8572H5.71443C5.10822 30.8572 4.52684 30.6164 4.09818 30.1877C3.66953 29.759 3.42871 29.1777 3.42871 28.5715V3.4286C3.42871 2.82239 3.66953 2.24101 4.09818 1.81235C4.52684 1.3837 5.10822 1.14288 5.71443 1.14288H17.143L28.5716 12.5715V28.5715Z"
                    fill={theme.primary}
                    fillOpacity="0.08"
                    stroke={theme.textDark}
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M10.2859 10.2858H14.8573" stroke="#041616" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.2859 17.1429H21.7145" stroke="#041616" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.2859 24H21.7145" stroke="#041616" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontFamily: theme.fontFamily,
                    fontWeight: 600,
                    color: theme.textDark,
                  }}
                >
                  {fileName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontFamily: theme.fontFamily,
                    color: theme.textMuted,
                  }}
                >
                  {fileSize}
                </Typography>
              </Box>
            </Box>
          )}

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
        </Box>
      </Box>
    </Box>
  );
}

