"use client";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface FileAttachmentContentProps {
  fileName: string;
  fileSize: string;
  timestamp: string;
  fileType?: string;
  fileUrl?: string;
}

export function FileAttachmentContent({
  fileName,
  fileSize,
  timestamp,
  fileType,
  fileUrl,
}: FileAttachmentContentProps) {
  const theme = useTheme();
  const isImage = fileType?.startsWith("image/") && fileUrl;

  return (
    <Box
      sx={{
        bgcolor: "action.hover",
        borderRadius: "16px",
        p: 2,
        maxWidth: "100%",
      }}
    >
      {isImage ? (
        <Box sx={{ borderRadius: "12px", overflow: "hidden", maxWidth: "100%", mb: 1 }}>
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
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>{fileName}</Typography>
            <Typography sx={{ fontSize: "12px", color: "grey.800" }}>{fileSize}</Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            bgcolor: "action.selected",
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
              bgcolor: "background.paper",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M28.5716 28.5715C28.5716 29.1777 28.3308 29.759 27.9021 30.1877C27.4734 30.6164 26.8921 30.8572 26.2859 30.8572H5.71443C5.10822 30.8572 4.52684 30.6164 4.09818 30.1877C3.66953 29.759 3.42871 29.1777 3.42871 28.5715V3.4286C3.42871 2.82239 3.66953 2.24101 4.09818 1.81235C4.52684 1.3837 5.10822 1.14288 5.71443 1.14288H17.143L28.5716 12.5715V28.5715Z"
                fill={theme.palette.primary.main}
                fillOpacity="0.08"
                stroke={theme.palette.text.primary}
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
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>{fileName}</Typography>
            <Typography sx={{ fontSize: "12px", color: "grey.800" }}>{fileSize}</Typography>
          </Box>
        </Box>
      )}

      <Typography
        sx={{
          fontSize: "10px",
          fontWeight: 400,
          color: "grey.800",
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
  );
}
