"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import MedicationIcon from "@mui/icons-material/Medication";
import { StepMedications, Medication } from "@/shared/components/HealthData";
import { TriageStepper } from "../components/TriageStepper";

// Chave para armazenar temporariamente durante o fluxo de onboarding
const TEMP_MEDICATIONS_KEY = "onboarding_temp_medications";

export default function TriagemStep2Page() {
  const router = useRouter();
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);

  useEffect(() => {
    // Recupera seleções temporárias do fluxo atual (caso volte para esta página)
    const saved = sessionStorage.getItem(TEMP_MEDICATIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSelectedMedications(parsed);
      } catch {}
    }
  }, []);

  const handleSelect = (medication: Medication) => {
    if (!selectedMedications.find((m) => m.id === medication.id)) {
      setSelectedMedications([...selectedMedications, medication]);
    }
  };

  const handleRemove = (id: string) => {
    setSelectedMedications(selectedMedications.filter((m) => m.id !== id));
  };

  useEffect(() => {
    // Salva temporariamente em sessionStorage (limpa ao fechar aba)
    if (selectedMedications.length === 0) {
      sessionStorage.removeItem(TEMP_MEDICATIONS_KEY);
    } else {
      sessionStorage.setItem(TEMP_MEDICATIONS_KEY, JSON.stringify(selectedMedications));
    }
  }, [selectedMedications]);

  const handleContinue = () => {
    router.push("/paciente/onboarding/triagem/step3");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 3 }, py: 4, gap: 3 }}>
      <TriageStepper activeStep={1} />

      <Box sx={{ width: 170, height: 170, borderRadius: "50%", bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MedicationIcon sx={{ fontSize: 80, color: "primary.contrastText" }} />
      </Box>

      <Typography sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, fontWeight: 700, color: "text.primary", textAlign: "center", maxWidth: 576 }}>
        Está utilizando algum medicamento de uso contínuo?
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 576 }}>
        <StepMedications
          selectedMedications={selectedMedications}
          onSelect={handleSelect}
          onRemove={handleRemove}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: "100%", maxWidth: 576 }}>
        <Button variant="outlined" onClick={handleContinue} sx={{ flex: 1, height: { xs: 48, sm: 52 } }}>
          Pular
        </Button>
        <Button variant="contained" onClick={handleContinue} sx={{ flex: 1, height: { xs: 48, sm: 52 } }}>
          Responder
        </Button>
      </Box>
    </Box>
  );
}
