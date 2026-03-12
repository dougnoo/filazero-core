"use client";

import { Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useRouter } from "next/navigation";

const STEP_ROUTES = [
  "/paciente/onboarding/triagem/step1",
  "/paciente/onboarding/triagem/step2",
  "/paciente/onboarding/triagem/step3",
];

interface TriageStepperProps {
  activeStep: number;
}

export function TriageStepper({ activeStep }: TriageStepperProps) {
  const router = useRouter();

  const renderStep = (index: number) => {
    const completed = index < activeStep;
    const active = index === activeStep;
    const isPast = index < activeStep;

    return (
      <Box
        key={index}
        onClick={() => {
          // Só permite navegar para steps anteriores ou atual
          if (index <= activeStep) {
            router.push(STEP_ROUTES[index]);
          }
        }}
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: index <= activeStep ? "pointer" : "default",
          transition: "all 0.2s",
          bgcolor: completed ? "primary.main" : "background.paper",
          border: 3,
          borderStyle: "solid",
          borderColor: completed ? "primary.main" : (active || isPast) ? "primary.main" : "divider",
          "&:hover": index <= activeStep ? { opacity: 0.8 } : {},
        }}
      >
        {completed ? (
          <CheckIcon sx={{ color: "primary.contrastText", fontSize: 20 }} />
        ) : (
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              bgcolor: (active || isPast) ? "primary.main" : "divider",
            }}
          />
        )}
      </Box>
    );
  };

  const renderConnector = (index: number) => {
    const isPast = index < activeStep;

    return (
      <Box
        key={`connector-${index}`}
        sx={{
          width: 80,
          height: 3,
          bgcolor: isPast ? "primary.main" : "divider",
          borderRadius: 1,
        }}
      />
    );
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 8 }}>
      {renderStep(0)}
      {renderConnector(0)}
      {renderStep(1)}
      {renderConnector(1)}
      {renderStep(2)}
    </Box>
  );
}
