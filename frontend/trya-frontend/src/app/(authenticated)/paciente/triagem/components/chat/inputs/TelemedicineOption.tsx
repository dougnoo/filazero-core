"use client";

import { Box, Typography } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import ConnectDoctorButton from "../../sidebar/ConnectDoctorButton";

interface TelemedicineOptionProps {
  content: string;
  timestamp: string;
}

export function TelemedicineOption({ content, timestamp }: TelemedicineOptionProps) {
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
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: "13px", md: "14px" },
          fontWeight: 400,
          lineHeight: { xs: "18px", md: "20px" },
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          mb: 2,
        }}
      >
        {content}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          p: { xs: 1, md: 1.5 },
          bgcolor: "rgba(10, 58, 58, 0.08)",
          borderRadius: { xs: "6px", md: "8px" },
        }}
      >
        <VideocamIcon sx={{ fontSize: { xs: 18, md: 20 }, flexShrink: 0 }} />
        <Box>
          <Typography
            sx={{
              fontSize: { xs: "11px", md: "12px" },
              fontWeight: 500,
              color: "grey.600",
              lineHeight: 1.2,
            }}
          >
            Consulta online
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "13px", md: "14px" },
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            Telemedicina disponível
          </Typography>
        </Box>
      </Box>

      <ConnectDoctorButton />

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
            mt: { xs: 1, md: 1.5 },
          }}
        >
          {timestamp} ✓✓
        </Typography>
      )}
    </Box>
  );
}
