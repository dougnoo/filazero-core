"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { HeartMonitorIcon, MedicationSearchIcon, AllergyFaceIcon, IntroPersonIcon } from "./icons";
import { HealthDataStepper } from "./HealthDataStepper";
import { StepConditions } from "./steps/StepConditions";
import { StepMedications } from "./steps/StepMedications";
import { StepAllergies } from "./steps/StepAllergies";
import { useHealthDataSubmit, HealthDataDialogState } from "./hooks/useHealthDataSubmit";
import { useToast } from "@/shared/context/ToastContext";
import type { ChronicCondition } from "./hooks/useChronicConditionsSearch";
import type { Medication } from "./hooks/useMedicationsSearch";

export interface HealthDataDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: {
    conditions: ChronicCondition[];
    medications: Medication[];
    allergies: string;
  };
  onSuccess: () => void;
}

const STEP_TITLES = [
  "Você possui alguma condição de saúde crônica?",
  "Você utiliza algum medicamento regularmente?",
  "Você possui alguma alergia?",
];

const STEP_ICONS = [
  <HeartMonitorIcon key="conditions" sx={{ fontSize: 60, color: "primary.contrastText" }} />,
  <MedicationSearchIcon key="medications" sx={{ fontSize: 60, color: "primary.contrastText" }} />,
  <AllergyFaceIcon key="allergies" sx={{ fontSize: 60, color: "primary.contrastText" }} />,
];

const TOTAL_STEPS = 3;

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <>
      <DialogContent sx={{ pt: 4, pb: 2, textAlign: "center" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IntroPersonIcon sx={{ fontSize: 70, color: "primary.contrastText" }} />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Vamos conhecer um pouco sobre você
        </Typography>

        <Typography sx={{ color: "text.secondary", fontSize: "14px", lineHeight: 1.6 }}>
          Conte um pouco sobre seu histórico de saúde — é rápido, seguro e faz toda a diferença no seu atendimento.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="contained" onClick={onStart} fullWidth>
          Começar
        </Button>
      </DialogActions>
    </>
  );
}

export function HealthDataDialog({ open, onClose, initialData, onSuccess }: HealthDataDialogProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [dialogState, setDialogState] = useState<HealthDataDialogState>({
    selectedConditions: [],
    selectedMedications: [],
    allergiesText: "",
  });

  const { submit, isSubmitting } = useHealthDataSubmit();
  const { showError } = useToast();

  useEffect(() => {
    if (open) {
      // Check if user already has health data - skip intro if so
      const hasExistingData =
        (initialData?.conditions && initialData.conditions.length > 0) ||
        (initialData?.medications && initialData.medications.length > 0) ||
        (initialData?.allergies && initialData.allergies.trim() !== "");

      setShowIntro(!hasExistingData);
      setActiveStep(0);
      setDialogState({
        selectedConditions: initialData?.conditions ?? [],
        selectedMedications: initialData?.medications ?? [],
        allergiesText: initialData?.allergies ?? "",
      });
    }
  }, [open, initialData]);

  const handleStartSteps = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleStepClick = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const handleSelectCondition = useCallback((condition: ChronicCondition) => {
    setDialogState((prev) => ({
      ...prev,
      selectedConditions: [...prev.selectedConditions, condition],
    }));
  }, []);

  const handleRemoveCondition = useCallback((id: string) => {
    setDialogState((prev) => ({
      ...prev,
      selectedConditions: prev.selectedConditions.filter((c) => c.id !== id),
    }));
  }, []);

  const handleSelectMedication = useCallback((medication: Medication) => {
    setDialogState((prev) => ({
      ...prev,
      selectedMedications: [...prev.selectedMedications, medication],
    }));
  }, []);

  const handleRemoveMedication = useCallback((id: string) => {
    setDialogState((prev) => ({
      ...prev,
      selectedMedications: prev.selectedMedications.filter((m) => m.id !== id),
    }));
  }, []);

  const handleAllergiesChange = useCallback((value: string) => {
    setDialogState((prev) => ({
      ...prev,
      allergiesText: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (dataToSubmit: HealthDataDialogState) => {
      try {
        await submit(dataToSubmit);
        onSuccess();
        onClose();
      } catch {
        showError("Erro ao salvar dados de saúde. Tente novamente.");
      }
    },
    [submit, onSuccess, onClose, showError]
  );

  const handleSkip = useCallback(async () => {
    const isLastStep = activeStep === TOTAL_STEPS - 1;

    if (isLastStep) {
      const dataToSubmit: HealthDataDialogState = {
        ...dialogState,
        allergiesText: "",
      };
      await handleSubmit(dataToSubmit);
    } else {
      if (activeStep === 0) {
        setDialogState((prev) => ({ ...prev, selectedConditions: [] }));
      } else if (activeStep === 1) {
        setDialogState((prev) => ({ ...prev, selectedMedications: [] }));
      }
      setActiveStep((prev) => prev + 1);
    }
  }, [activeStep, dialogState, handleSubmit]);

  const handleRespond = useCallback(async () => {
    const isLastStep = activeStep === TOTAL_STEPS - 1;

    if (isLastStep) {
      await handleSubmit(dialogState);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  }, [activeStep, dialogState, handleSubmit]);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepConditions
            selectedConditions={dialogState.selectedConditions}
            onSelect={handleSelectCondition}
            onRemove={handleRemoveCondition}
          />
        );
      case 1:
        return (
          <StepMedications
            selectedMedications={dialogState.selectedMedications}
            onSelect={handleSelectMedication}
            onRemove={handleRemoveMedication}
          />
        );
      case 2:
        return <StepAllergies value={dialogState.allergiesText} onChange={handleAllergiesChange} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2, m: { xs: 2, md: 3 } } } }}
      aria-labelledby="health-data-dialog-title"
    >
      {showIntro ? (
        <IntroScreen onStart={handleStartSteps} />
      ) : (
        <>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <HealthDataStepper activeStep={activeStep} onStepClick={handleStepClick} />

            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {STEP_ICONS[activeStep]}
              </Box>
            </Box>

            <Typography id="health-data-dialog-title" variant="h6" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>
              {STEP_TITLES[activeStep]}
            </Typography>

            <Box sx={{ minHeight: 200 }}>{renderStepContent()}</Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
            <Button variant="outlined" onClick={handleSkip} disabled={isSubmitting} sx={{ flex: 1 }}>
              {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Pular"}
            </Button>
            <Button variant="contained" onClick={handleRespond} disabled={isSubmitting} sx={{ flex: 1 }}>
              {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Responder"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
