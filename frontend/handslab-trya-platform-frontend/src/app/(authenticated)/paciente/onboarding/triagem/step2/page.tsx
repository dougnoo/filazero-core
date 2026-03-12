"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@/shared/hooks/useTheme";
import { api } from "@/shared/services/api";

const TRIAGEM_STEP2_COMPLETED_KEY = "paciente_triagem_step2_completed";
const TRIAGEM_STEP1_COMPLETED_KEY = "paciente_triagem_step1_completed";
const TRIAGEM_STEP3_COMPLETED_KEY = "paciente_triagem_step3_completed";

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

// Componente do ícone de busca
const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z"
      fill="#49454F"
    />
  </svg>
);

interface Medication {
  id: string;
  name: string;
  activePrinciple: string;
}

export default function TriagemStep2Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const primaryColor = theme?.colors?.primary || "#F4B840";
  const secondaryColor = theme?.colors?.secondary || "#041616";
  const backgroundColor = theme?.colors?.background || "#FFFFFF";
  const fontFamily = theme?.typography?.fontFamily || "Inter, sans-serif";

  // Componente SVG de Medicamentos
  const MedicationIcon = () => (
    <svg 
      width="85" 
      height="85" 
      viewBox="0 0 85 85" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M49.0682 38.802C50.8189 37.1474 53.1461 36.2404 55.5551 36.2744C57.9638 36.308 60.2645 37.2802 61.968 38.9837C63.6716 40.6869 64.6434 42.9879 64.6774 45.3966C64.7114 47.8057 63.8044 50.1325 62.1494 51.8835L51.0005 63.032C49.2598 64.6987 46.9372 65.6203 44.5271 65.6008C42.1173 65.5813 39.8099 64.6222 38.0961 62.9279C36.3823 61.2332 35.3972 58.9371 35.3504 56.5274C35.3035 54.118 36.1985 51.7851 37.845 50.0252L49.0682 38.802Z" 
        stroke={secondaryColor}
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M44.0156 43.8589L57.0968 56.94" 
        stroke={secondaryColor}
        strokeWidth="3.03571" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M29.4033 40.4595C35.7845 40.4595 40.9571 35.2868 40.9571 28.9058C40.9571 22.5248 35.7845 17.3521 29.4033 17.3521C23.0224 17.3521 17.8496 22.5248 17.8496 28.9058C17.8496 35.2868 23.0224 40.4595 29.4033 40.4595Z" 
        stroke={secondaryColor}
        strokeWidth="3.03571" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M17.8496 28.9062H40.9571" 
        stroke={secondaryColor}
        strokeWidth="3.03571" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M39.5337 75.1145C59.1836 75.1145 75.1129 59.1851 75.1129 39.5349C75.1129 19.885 59.1836 3.95557 39.5337 3.95557C19.8836 3.95557 3.9541 19.885 3.9541 39.5349C3.9541 59.1851 19.8836 75.1145 39.5337 75.1145Z" 
        stroke={secondaryColor}
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M64.6787 64.6758L81.0451 81.0422" 
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
    const savedMedications = localStorage.getItem("paciente_medications");
    if (savedMedications) {
      try {
        const parsed = JSON.parse(savedMedications);
        if (Array.isArray(parsed)) {
          setSelectedMedications(parsed);
        }
      } catch (error) {
      }
    }
  }, []);

  const fetchMedications = useCallback(async (searchName?: string) => {
    setIsLoading(true);
    try {
      const endpoint = searchName && searchName.trim().length > 0
        ? `/api/medications?name=${encodeURIComponent(searchName.trim())}`
        : `/api/medications`;
      const data = await api.get<Medication[]>(endpoint, "Erro ao buscar medicamentos");
      setFilteredMedications(Array.isArray(data) ? data : []);
    } catch (error) {
      setFilteredMedications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca quando o usuário digita
  useEffect(() => {
    // Limpa o timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Se o campo estiver vazio, limpa os resultados
    if (searchTerm.trim() === "") {
      setFilteredMedications([]);
      return;
    }

    // Debounce: aguarda 500ms antes de fazer a busca
    searchTimeoutRef.current = setTimeout(() => {
      fetchMedications(searchTerm);
    }, 500);

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchMedications]);

  const handleSelectMedication = (medication: Medication) => {
    if (!selectedMedications.find((m) => m.id === medication.id)) {
      setSelectedMedications([...selectedMedications, medication]);
    }
    setSearchTerm("");
    setFilteredMedications([]);
  };

  const handleRemoveMedication = (medicationId: string) => {
    setSelectedMedications(selectedMedications.filter((m) => m.id !== medicationId));
  };

  // Salva automaticamente no localStorage sempre que selectedMedications mudar
  useEffect(() => {
    if (selectedMedications.length === 0) {
      // Se não houver medicamentos selecionados, remove do localStorage
      localStorage.removeItem("paciente_medications");
    } else {
      // Salva os medicamentos selecionados
      localStorage.setItem("paciente_medications", JSON.stringify(selectedMedications));
    }
  }, [selectedMedications]);

  const handleContinue = () => {
    localStorage.setItem(TRIAGEM_STEP2_COMPLETED_KEY, "true");
    router.push("/paciente/onboarding/triagem/step3");
  };

  const handleSkip = () => {
    localStorage.setItem(TRIAGEM_STEP2_COMPLETED_KEY, "true");
    router.push("/paciente/onboarding/triagem/step3");
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
        {/* Círculo 2 - Ativo (selecionado) */}
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
            backgroundColor: step2Completed ? primaryColor : "#D4DEDE",
          }}
        />
        {/* Círculo 3 - Não selecionado */}
        <Box
          onClick={() => router.push("/paciente/onboarding/triagem/step3")}
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: step3Completed ? "none" : "3px solid #D4DEDE",
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
                border: "1px solid #D4DEDE",
                backgroundColor: "#D4DEDE",
              }}
            />
          )}
        </Box>
      </Box>

      {/* Ícone de Medicamentos com Background Circular */}
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
        <MedicationIcon />
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
        Está utilizando algum medicamento de uso contínuo?
      </Typography>

      {/* Campo de Busca */}
      <Box sx={{ width: "100%", maxWidth: "576px" }}>
        <TextField
          fullWidth
          placeholder="Buscar medicamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "56px",
              borderRadius: "8px",
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
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#9E9E9E",
              opacity: 1,
            },
          }}
        />

        {/* Lista de Sugestões */}
        {(filteredMedications.length > 0 || isLoading) && (
          <Box
            sx={{
              mt: 1,
              border: "1px solid #D4DEDE",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 3,
                }}
              >
                <CircularProgress size={24} sx={{ color: primaryColor }} />
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredMedications.map((medication) => (
                  <ListItem key={medication.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelectMedication(medication)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        "&:hover": {
                          backgroundColor: `${primaryColor}20`,
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          color: secondaryColor,
                          fontFamily: fontFamily,
                        }}
                      >
                        {medication.name}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Medicamentos Selecionados */}
        {selectedMedications.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mt: 2,
            }}
          >
            {selectedMedications.map((medication) => (
              <Chip
                key={medication.id}
                label={medication.name}
                onDelete={() => handleRemoveMedication(medication.id)}
                sx={{
                  backgroundColor: `${primaryColor}30`,
                  color: secondaryColor,
                  fontFamily: fontFamily,
                  "& .MuiChip-deleteIcon": {
                    color: secondaryColor,
                  },
                }}
              />
            ))}
          </Box>
        )}
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
          }}
        >
          Responder
        </Button>
      </Box>
    </Box>
  );
}

