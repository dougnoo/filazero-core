"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { useTheme } from "@/shared/hooks/useTheme";
import { api } from "@/shared/services/api";

const TRIAGEM_STEP3_COMPLETED_KEY = "paciente_triagem_step3_completed";
const TRIAGEM_STEP1_COMPLETED_KEY = "paciente_triagem_step1_completed";
const TRIAGEM_STEP2_COMPLETED_KEY = "paciente_triagem_step2_completed";

// Componente do ícone de checkmark
const CheckmarkIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0.642578 10.9929L4.15258 15.5058C4.27102 15.6597 4.42278 15.7847 4.59647 15.8716C4.77016 15.9584 4.96126 16.0048 5.15544 16.0072C5.34648 16.0094 5.53562 15.969 5.7091 15.889C5.88258 15.8089 6.03603 15.6912 6.15829 15.5443L17.3569 1.99292"
      stroke={color}
      strokeWidth="0.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ChronicCondition {
  id: string;
  name: string;
}

interface Medication {
  id: string;
  name: string;
  activePrinciple: string;
}

export default function TriagemStep3Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const [allergiesText, setAllergiesText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryColor = theme?.colors?.primary || "#F4B840";
  const secondaryColor = theme?.colors?.secondary || "#041616";
  const backgroundColor = theme?.colors?.background || "#FFFFFF";
  const fontFamily = theme?.typography?.fontFamily || "Inter, sans-serif";

  // Componente SVG de Alergia
  const AllergyIcon = () => (
    <svg 
      width="85" 
      height="85" 
      viewBox="0 0 85 85" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M72.3371 44.9881H69.0821C67.9375 44.9853 66.829 44.5877 65.9435 43.8624C65.058 43.137 64.4499 42.1285 64.2218 41.0068L62.5248 32.4741C42.6998 32.4741 42.4996 22.6074 42.4996 22.6074C42.4996 22.6074 42.2925 32.4707 22.4744 32.4707L20.7773 41.0068C20.5485 42.1287 19.9397 43.1374 19.0537 43.8627C18.1677 44.5879 17.0586 44.9854 15.9136 44.9881H12.6553" 
        stroke={secondaryColor}
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M37.5277 45.0865C37 44.2622 36.2594 43.5959 35.3841 43.158C34.5088 42.72 33.5314 42.5268 32.5554 42.5986C31.5793 42.5268 30.6019 42.72 29.7266 43.158C28.8514 43.5959 28.1107 44.2622 27.583 45.0865" 
        stroke={secondaryColor}
        strokeWidth="3.03571" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M57.4344 45.0863C56.9067 44.262 56.1661 43.5957 55.2908 43.1577C54.4155 42.7198 53.4382 42.5265 52.4621 42.5984C51.4854 42.5259 50.5074 42.7189 49.6314 43.1568C48.7555 43.5948 48.0143 44.2615 47.4863 45.0863" 
        stroke={secondaryColor}
        strokeWidth="3.03571" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M72.3983 44.5771C74.8149 29.7279 74.4347 5.20557 42.4997 5.20557C10.5646 5.20557 10.1845 29.7313 12.601 44.5771C10.8349 45.3172 9.37906 46.6453 8.48038 48.3363C7.58169 50.0273 7.29548 51.9771 7.67027 53.855C8.04505 55.7329 9.05777 57.4234 10.5367 58.6399C12.0156 59.8563 13.8698 60.5239 15.7847 60.5294C16.1259 60.5164 16.466 60.4824 16.8029 60.4275C17.4246 61.113 17.8399 61.9601 18.0011 62.8713C20.1733 75.9929 35.0326 79.7976 42.4997 79.7976C49.9667 79.7976 64.8294 75.9929 67.0254 62.8883C67.1902 61.9783 67.6051 61.1321 68.2235 60.4445C68.5515 60.4978 68.8825 60.5306 69.2146 60.5429C71.1295 60.5375 72.9837 59.8699 74.4626 58.6535C75.9415 57.437 76.9543 55.7465 77.329 53.8685C77.7038 51.9906 77.4176 50.0409 76.5189 48.3499C75.6203 46.6589 74.1644 45.3308 72.3983 44.5907V44.5771Z" 
        stroke={secondaryColor}
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M66.4012 52.7808C50.8856 57.3085 34.3993 57.3085 18.8838 52.7808V66.1162C22.7666 76.6107 35.7117 79.7978 42.4999 79.7978C49.4544 79.7978 62.834 76.4817 66.4012 65.4238V52.7808Z" 
        stroke={secondaryColor}
        strokeWidth="3.03571" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M18.8841 52.7809L13.793 45.9927" 
        stroke={secondaryColor}
        strokeWidth="3.03571" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M66.4014 52.7809L71.4925 45.9927" 
        stroke={secondaryColor}
        strokeWidth="3.03571" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  // Verifica quais steps estão completados
  const step1Completed = localStorage.getItem(TRIAGEM_STEP1_COMPLETED_KEY) === "true";
  const step2Completed = localStorage.getItem(TRIAGEM_STEP2_COMPLETED_KEY) === "true";
  const step3Completed = localStorage.getItem(TRIAGEM_STEP3_COMPLETED_KEY) === "true";

  // Carrega dados salvos do localStorage
  useEffect(() => {
    const savedAllergies = localStorage.getItem("paciente_allergies");
    if (savedAllergies) {
      try {
        // Se for string, carrega diretamente
        if (typeof savedAllergies === "string" && !savedAllergies.startsWith("[")) {
          setAllergiesText(savedAllergies);
        } else {
          // Se for JSON, tenta parsear
          const parsed = JSON.parse(savedAllergies);
          if (typeof parsed === "string") {
            setAllergiesText(parsed);
          }
        }
      } catch {
        // Se não for JSON válido, trata como string
        setAllergiesText(savedAllergies);
      }
    }
  }, []);

  // Salva automaticamente sempre que allergiesText mudar
  useEffect(() => {
    if (allergiesText.trim() === "") {
      // Se o campo estiver vazio, remove do localStorage
      localStorage.removeItem("paciente_allergies");
    } else {
      // Salva o texto das alergias
      localStorage.setItem("paciente_allergies", allergiesText);
    }
  }, [allergiesText]);

  const handleContinue = async () => {
    setIsSubmitting(true);
    
    try {
      // Coleta dados dos steps anteriores
      const savedConditions = localStorage.getItem("paciente_chronic_conditions");
      const savedMedications = localStorage.getItem("paciente_medications");
      
      // Prepara o body
      const body: {
        chronicConditionIds: string[];
        medications: Array<{ medicationId: string; dosage: null }>;
        allergies: string;
      } = {
        chronicConditionIds: [],
        medications: [],
        allergies: allergiesText.trim() || "",
      };

      // Processa condições crônicas
      if (savedConditions) {
        try {
          const conditions = JSON.parse(savedConditions) as ChronicCondition[];
          if (Array.isArray(conditions)) {
            body.chronicConditionIds = conditions.map((c) => c.id);
          }
        } catch (error) {
        }
      }

      // Processa medicamentos
      if (savedMedications) {
        try {
          const medications = JSON.parse(savedMedications) as Medication[];
          if (Array.isArray(medications)) {
            body.medications = medications.map((m) => ({
              medicationId: m.id,
              dosage: null,
            }));
          }
        } catch (error) {
        }
      }

      // Faz o POST para /api/onboard
      await api.post("/api/onboard", body, "Erro ao salvar dados de onboarding");

      // Salva que completou o step3
      localStorage.setItem(TRIAGEM_STEP3_COMPLETED_KEY, "true");
      
      // Redireciona para a tela final
      router.push("/paciente/onboarding/triagem/final");
    } catch (error) {
      // Mesmo com erro, permite continuar
      localStorage.setItem(TRIAGEM_STEP3_COMPLETED_KEY, "true");
      router.push("/paciente/onboarding/triagem/final");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(TRIAGEM_STEP3_COMPLETED_KEY, "true");
    router.push("/paciente/onboarding/triagem/final");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: backgroundColor,
        px: { xs: 2, sm: 3 },
        py: 4,
        gap: 3,
      }}
    >
      {/* Indicador de Progresso */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "5rem" }}>
        {/* Círculo 1 - Completo */}
        <Box
          onClick={() => router.push("/paciente/onboarding/triagem/step1")}
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: step1Completed ? "none" : `3px solid ${primaryColor}`,
            backgroundColor: step1Completed ? primaryColor : "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          {step1Completed ? (
            <CheckmarkIcon color={secondaryColor} />
          ) : (
            <Box
              sx={{
                width: 16.71,
                height: 16.71,
                borderRadius: "50%",
                border: `1px solid ${primaryColor}`,
                backgroundColor: primaryColor,
              }}
            />
          )}
        </Box>
        {/* Linha 1 */}
        <Box
          sx={{
            width: "102px",
            height: 3,
            backgroundColor: step1Completed ? primaryColor : primaryColor,
          }}
        />
        {/* Círculo 2 - Completo */}
        <Box
          onClick={() => router.push("/paciente/onboarding/triagem/step2")}
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: step2Completed ? "none" : `3px solid ${primaryColor}`,
            backgroundColor: step2Completed ? primaryColor : "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          {step2Completed ? (
            <CheckmarkIcon color={secondaryColor} />
          ) : (
            <Box
              sx={{
                width: 16.71,
                height: 16.71,
                borderRadius: "50%",
                border: `1px solid ${primaryColor}`,
                backgroundColor: primaryColor,
              }}
            />
          )}
        </Box>
        {/* Linha 2 */}
        <Box
          sx={{
            width: "102px",
            height: 3,
            backgroundColor: step2Completed ? primaryColor : primaryColor,
          }}
        />
        {/* Círculo 3 - Ativo (selecionado) */}
        <Box
          onClick={() => router.push("/paciente/onboarding/triagem/step3")}
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: step3Completed ? "none" : `3px solid ${primaryColor}`,
            backgroundColor: step3Completed ? primaryColor : "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          {step3Completed ? (
            <CheckmarkIcon color={secondaryColor} />
          ) : (
            <Box
              sx={{
                width: 16.71,
                height: 16.71,
                borderRadius: "50%",
                border: `1px solid ${primaryColor}`,
                backgroundColor: primaryColor,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Ícone de Alergia com Background Circular */}
      <Box
        sx={{
          width: "170px",
          height: "170px",
          borderRadius: "50%",
          backgroundColor: primaryColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AllergyIcon />
      </Box>

      {/* Título */}
      <Typography
        sx={{
          fontSize: { xs: "24px", sm: "28px", md: "32px" },
          fontWeight: 700,
          color: secondaryColor,
          fontFamily: fontFamily,
          lineHeight: 1.2,
          textAlign: "center",
          maxWidth: "576px",
        }}
      >
        Possui alguma alergia a medicamentos ou substâncias?
      </Typography>

      {/* Campo de Texto */}
      <Box sx={{ width: "100%", maxWidth: "576px" }}>
        <TextField
          fullWidth
          multiline
          rows={allergiesText.trim() === "" ? 1 : undefined}
          minRows={1}
          maxRows={4}
          placeholder="Digite suas alergias..."
          value={allergiesText}
          onChange={(e) => setAllergiesText(e.target.value)}
          sx={{
            "&.MuiFormControl-root": {
              height: allergiesText.trim() === "" ? "56px" : "auto",
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              height: allergiesText.trim() === "" ? "56px !important" : "auto",
              alignItems: "flex-start",
              padding: "0 !important",
              "& fieldset": {
                borderColor: "#D4DEDE",
              },
              "&:hover fieldset": {
                borderColor: secondaryColor,
              },
              "&.Mui-focused fieldset": {
                borderColor: primaryColor,
                borderWidth: "2px",
              },
            },
            "& .MuiInputBase-input": {
              fontFamily: fontFamily,
              color: secondaryColor,
              fontSize: "16px",
              padding: allergiesText.trim() === "" ? "16px 14px !important" : "16px 14px",
              height: allergiesText.trim() === "" ? "56px !important" : "auto",
              minHeight: allergiesText.trim() === "" ? "56px !important" : "24px",
              lineHeight: "24px",
              boxSizing: "border-box",
              overflow: allergiesText.trim() === "" ? "hidden" : "auto",
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#9E9E9E",
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* Botões */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          width: "100%",
          maxWidth: "576px",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleSkip}
          sx={{
            flex: 1,
            height: { xs: "48px", sm: "52px" },
            backgroundColor: "#FFFFFF",
            color: secondaryColor,
            fontFamily: fontFamily,
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "8px",
            border: `2px solid ${primaryColor}`,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#FFFFFF",
              border: `2px solid ${primaryColor}`,
              opacity: 0.9,
              boxShadow: "none",
            },
          }}
        >
          Pular
        </Button>

        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={isSubmitting}
          sx={{
            flex: 1,
            height: { xs: "48px", sm: "52px" },
            backgroundColor: primaryColor,
            color: secondaryColor,
            fontFamily: fontFamily,
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: primaryColor,
              opacity: 0.9,
              boxShadow: "none",
            },
            "&:disabled": {
              backgroundColor: primaryColor,
              color: secondaryColor,
              opacity: 0.5,
            },
          }}
        >
          {isSubmitting ? "Enviando..." : "Responder"}
        </Button>
      </Box>
    </Box>
  );
}

