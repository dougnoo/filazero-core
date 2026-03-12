"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, Alert } from "@mui/material";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { useToast } from "@/shared/context/ToastContext";
import { api } from "@/shared/services/api";
import { TriageStepper } from "../components/TriageStepper";
import { StepAllergies } from "@/shared/components/HealthData";

interface ChronicCondition {
  id: string;
  name: string;
}

interface Medication {
  id: string;
  name: string;
  activePrinciple: string;
}

// Chaves temporárias do sessionStorage
const TEMP_CONDITIONS_KEY = "onboarding_temp_chronic_conditions";
const TEMP_MEDICATIONS_KEY = "onboarding_temp_medications";
const TEMP_ALLERGIES_KEY = "onboarding_temp_allergies";

export default function TriagemStep3Page() {
  const router = useRouter();
  const { showError } = useToast();
  const [allergiesText, setAllergiesText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Recupera alergias temporárias do fluxo atual
    const saved = sessionStorage.getItem(TEMP_ALLERGIES_KEY);
    if (saved) {
      setAllergiesText(saved);
    }
  }, []);

  useEffect(() => {
    // Salva temporariamente em sessionStorage
    if (!allergiesText.trim()) {
      sessionStorage.removeItem(TEMP_ALLERGIES_KEY);
    } else {
      sessionStorage.setItem(TEMP_ALLERGIES_KEY, allergiesText);
    }
  }, [allergiesText]);

  const clearTempData = () => {
    sessionStorage.removeItem(TEMP_CONDITIONS_KEY);
    sessionStorage.removeItem(TEMP_MEDICATIONS_KEY);
    sessionStorage.removeItem(TEMP_ALLERGIES_KEY);
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const savedConditions = sessionStorage.getItem(TEMP_CONDITIONS_KEY);
      const savedMedications = sessionStorage.getItem(TEMP_MEDICATIONS_KEY);

      const body: {
        chronicConditionIds: string[];
        medications: Array<{ medicationId: string; dosage: null }>;
        allergies: string;
      } = {
        chronicConditionIds: [],
        medications: [],
        allergies: allergiesText.trim() || "",
      };

      if (savedConditions) {
        try {
          const conditions = JSON.parse(savedConditions) as ChronicCondition[];
          if (Array.isArray(conditions)) {
            body.chronicConditionIds = conditions.map((c) => c.id);
          }
        } catch {}
      }

      if (savedMedications) {
        try {
          const medications = JSON.parse(savedMedications) as Medication[];
          if (Array.isArray(medications)) {
            body.medications = medications.map((m) => ({ medicationId: m.id, dosage: null }));
          }
        } catch {}
      }

      await api.post("/api/onboard", body, "Erro ao salvar dados de onboarding");
      
      // Limpa dados temporários após sucesso
      clearTempData();
      
      router.push("/paciente/onboarding/triagem/final");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocorreu um erro ao salvar seus dados. Tente novamente.";
      setErrorMessage(message);
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/api/onboard", { chronicConditionIds: [], medications: [], allergies: "" }, "Erro ao salvar dados de onboarding");
      
      // Limpa dados temporários após sucesso
      clearTempData();
      
      router.push("/paciente/onboarding/triagem/final");
    } catch {
      // Mesmo com erro, limpa e avança
      clearTempData();
      router.push("/paciente/onboarding/triagem/final");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 3 }, py: 4, gap: 3 }}>
      <TriageStepper activeStep={2} />

      <Box sx={{ width: 170, height: 170, borderRadius: "50%", bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ReportProblemOutlinedIcon sx={{ fontSize: 80, color: "primary.contrastText" }} />
      </Box>

      <Typography sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, fontWeight: 700, color: "text.primary", textAlign: "center", maxWidth: 576 }}>
        Possui alguma alergia a medicamentos ou substâncias?
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 576 }}>
        <StepAllergies value={allergiesText} onChange={setAllergiesText} />
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ width: "100%", maxWidth: 576 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: "100%", maxWidth: 576 }}>
        <Button variant="outlined" onClick={handleSkip} disabled={isSubmitting} sx={{ flex: 1, height: { xs: 48, sm: 52 } }}>
          Pular
        </Button>
        <Button variant="contained" onClick={handleContinue} disabled={isSubmitting} sx={{ flex: 1, height: { xs: 48, sm: 52 } }}>
          {isSubmitting ? "Enviando..." : "Responder"}
        </Button>
      </Box>
    </Box>
  );
}
