"use client";

import { Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

export interface DialogStepperProps {
  activeStep: number;
  onStepClick: (step: number) => void;
}

/**
 * HealthDataStepper - Stepper visual com 3 steps para o dialog de dados de saúde.
 * Segue o mesmo layout visual do TriageStepper.
 * Permite navegação clicável para steps anteriores.
 * Indicadores visuais de step completo/atual/futuro.
 *
 * Requirements: 4.1, 5.5
 */
export function HealthDataStepper({ activeStep, onStepClick }: DialogStepperProps) {
  const handleStepClick = (index: number) => {
    // Only allow clicking on previous steps (Requirement 5.5)
    if (index < activeStep) {
      onStepClick(index);
    }
  };

  const renderStep = (index: number) => {
    const completed = index < activeStep;
    const active = index === activeStep;
    const isPast = index < activeStep;

    return (
      <Box
        key={index}
        onClick={() => handleStepClick(index)}
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isPast ? "pointer" : "default",
          transition: "all 0.2s",
          bgcolor: completed ? "primary.main" : "background.paper",
          border: 3,
          borderStyle: "solid",
          borderColor: completed ? "primary.main" : (active || isPast) ? "primary.main" : "divider",
          "&:hover": isPast ? { opacity: 0.8 } : {},
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
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
      {renderStep(0)}
      {renderConnector(0)}
      {renderStep(1)}
      {renderConnector(1)}
      {renderStep(2)}
    </Box>
  );
}
