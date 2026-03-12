"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { StepConditions, ChronicCondition } from "@/shared/components/HealthData";
import { TriageStepper } from "../components/TriageStepper";

// Chave para armazenar temporariamente durante o fluxo de onboarding
const TEMP_CONDITIONS_KEY = "onboarding_temp_chronic_conditions";

export default function TriagemStep1Page() {
  const router = useRouter();
  const [selectedConditions, setSelectedConditions] = useState<ChronicCondition[]>([]);

  useEffect(() => {
    // Recupera seleções temporárias do fluxo atual (caso volte para esta página)
    const saved = sessionStorage.getItem(TEMP_CONDITIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSelectedConditions(parsed);
      } catch {}
    }
  }, []);

  const handleSelect = (condition: ChronicCondition) => {
    if (!selectedConditions.find((c) => c.id === condition.id)) {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  const handleRemove = (id: string) => {
    setSelectedConditions(selectedConditions.filter((c) => c.id !== id));
  };

  useEffect(() => {
    // Salva temporariamente em sessionStorage (limpa ao fechar aba)
    if (selectedConditions.length === 0) {
      sessionStorage.removeItem(TEMP_CONDITIONS_KEY);
    } else {
      sessionStorage.setItem(TEMP_CONDITIONS_KEY, JSON.stringify(selectedConditions));
    }
  }, [selectedConditions]);

  const handleContinue = () => {
    router.push("/paciente/onboarding/triagem/step2");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 3 }, py: 4, gap: 3 }}>
      <TriageStepper activeStep={0} />

      <Box sx={{ width: 170, height: 170, borderRadius: "50%", bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FavoriteBorderIcon sx={{ fontSize: 80, color: "primary.contrastText" }} />
      </Box>

      <Typography sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, fontWeight: 700, color: "text.primary", textAlign: "center", maxWidth: 576 }}>
        Você possui alguma condição de saúde crônica?
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 576 }}>
        <StepConditions
          selectedConditions={selectedConditions}
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
