"use client";

import { Box, Typography, Stack, LinearProgress } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { AccessTime } from "@mui/icons-material";
import { Step as StepType, Patient } from "../../lib/types";

type ChatStatus = "analyzing" | "waiting" | "completed";

interface ChatHeaderProps {
  title: string;
  status: ChatStatus;
  // Mobile-only props for embedded info
  steps?: StepType[];
  currentStep?: number; // 1-5, 0 means not started
  patient?: Patient;
}

export function ChatHeader({ title, status, steps, currentStep = 0, patient }: ChatHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const getStatusDisplay = () => {
    switch (status) {
      case "analyzing":
        return { label: "Analisando", dot: "#4CAF50" };
      case "completed":
        return { label: "Concluído", dot: theme.palette.primary.main };
      case "waiting":
      default:
        return { label: "Online", dot: "#4CAF50" };
    }
  };

  const statusDisplay = getStatusDisplay();
  const showStatus = status !== "waiting";

  const totalSteps = steps?.length || 0;
  const progress = totalSteps > 0 && currentStep > 0 ? (currentStep / totalSteps) * 100 : 0;
  
  const currentStepTitle = steps && currentStep > 0 ? steps[currentStep - 1]?.title : 'Onboarding';

  const isNewChat = title === "Novo chat";
  
  const mobileTitle = isNewChat ? "Triagem em andamento" : title;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 5 },
        py: { xs: 1, md: 3 },
        bgcolor: "background.paper",
        borderBottom: 2,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          maxWidth: 808,
          mx: "auto",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.4px",
            }}
          >
            {title}
          </Typography>

          {showStatus && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: statusDisplay.dot,
                }}
              />
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "grey.800",
                }}
              >
                {statusDisplay.label}
              </Typography>
            </Box>
          )}
        </Box>

        {isMobile && patient && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography 
                sx={{
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '20px',
                }}
              >
                {mobileTitle}
              </Typography>
              
              <Stack direction="row" spacing={1.5} alignItems="center">
                {showStatus && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: statusDisplay.dot,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "11px",
                        fontWeight: 400,
                        color: "grey.600",
                      }}
                    >
                      {statusDisplay.label}
                    </Typography>
                  </Stack>
                )}
                
                {patient.startedAt && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AccessTime 
                      sx={{ 
                        fontSize: '11px',
                        color: 'grey.600',
                      }} 
                    />
                    <Typography 
                      sx={{
                        fontWeight: 400,
                        fontSize: '11px',
                        lineHeight: '16px',
                        color: 'grey.600',
                      }}
                    >
                      {patient.startedAt}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>

            {steps && steps.length > 0 && (
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: 'grey.600',
                    }}
                  >
                    Etapa {Math.max(1, currentStep)} de {totalSteps} - {currentStepTitle}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: 'grey.600',
                    }}
                  >
                    {Math.round(progress)}%
                  </Typography>
                </Stack>
                <LinearProgress 
                  value={progress} 
                  variant="determinate" 
                  sx={{ 
                    borderRadius: '2px',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: '2px',
                    },
                  }} 
                />
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
