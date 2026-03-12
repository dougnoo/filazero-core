"use client";

import { Box, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import type { MessageAttachment } from "@/shared/types/chat";
import ReactMarkdown from "react-markdown";

interface ExamContentProps {
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
}

export function ExamContent({ content, timestamp, attachments }: ExamContentProps) {
  const formatSize = (sizeInBytes: string) => {
    if (!sizeInBytes) return "";
    const bytes = parseInt(sizeInBytes, 10);
    if (isNaN(bytes)) return sizeInBytes;

    if (bytes < 1024) return `${bytes}b`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}kb`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
  };

  const handleDownload = (link: string) => {
    window.open(link, "_blank");
  };

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: { xs: "10px", md: "12px" },
        p: { xs: 1.5, md: 2 },
        border: "1px solid",
        borderColor: "divider",
        maxWidth: "100%",
        width: "100%",
        overflow: 'hidden'
      }}
    >
      {/* Conteúdo da mensagem */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            fontSize: "14px",
            lineHeight: 1.6,
            color: "text.primary",
            "& p": { m: 0, mb: 1, "&:last-child": { mb: 0 } },
            "& strong": { fontWeight: 600 },
          }}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </Box>
        <Typography
          sx={{
            fontSize: "11px",
            color: "text.secondary",
            mt: 1,
          }}
        >
          {timestamp}
        </Typography>
      </Box>

      {/* Lista de anexos */}
      {attachments && attachments.length > 0 && (
        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "#FFFFFF",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Documentos anexados
          </Typography>

          {attachments.map((attachment, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: "#F9FAFB",
                borderRadius: "8px",
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#F3F4F6",
                  borderColor: "primary.main",
                },
              }}
              onClick={() => handleDownload(attachment.link)}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "6px",
                  bgcolor: "white",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {attachment.name || attachment.filename}
                </Typography>
                {(attachment.size || attachment.extension) && (
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "text.secondary",
                    }}
                  >
                    {[formatSize(attachment.size), attachment.extension?.toUpperCase()]
                      .filter(Boolean)
                      .join(" • ")}
                  </Typography>
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "primary.main",
                  textDecoration: "underline",
                  flexShrink: 0,
                }}
              >
                Baixar
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
