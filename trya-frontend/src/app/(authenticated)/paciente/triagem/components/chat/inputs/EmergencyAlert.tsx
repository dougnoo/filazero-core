"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { EmergencyDialog } from "@/shared/components/EmergencyDialog";

const EMERGENCY_NUMBER = "192";

interface EmergencyAlertProps {
  content: string;
  timestamp: string;
}

export function EmergencyAlert({
  content,
  timestamp,
}: EmergencyAlertProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showDialog, setShowDialog] = useState(false);

  const handleCallSamu = () => {
    if (isMobile) {
      window.location.href = `tel:${EMERGENCY_NUMBER}`;
    } else {
      setShowDialog(true);
    }
  };

  const handleSearchEmergency = () => {
    router.push("/paciente/rede-credenciada?search=pronto socorro");
  };

  return (
    <>
      <Box
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
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
            gap: { xs: 1, md: 1.5 },
            flexWrap: "wrap",
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          <Button
            aria-label="Buscar Pronto Atendimento"
            onClick={handleSearchEmergency}
            variant="contained"
          >
            Buscar Pronto Atendimento
          </Button>

          <Button
            aria-label="Ligar para o SAMU"
            onClick={handleCallSamu}
            variant="contained"
          >
            Ligar para o SAMU
          </Button>
        </Box>

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

      <EmergencyDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </>
  );
}
