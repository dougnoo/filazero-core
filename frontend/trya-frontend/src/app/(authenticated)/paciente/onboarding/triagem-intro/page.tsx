"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { api } from "@/shared/services/api";

export default function TriagemIntroPage() {
  const router = useRouter();
  const muiTheme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Componente SVG de Perfil
  const ProfileIcon = () => (
    <svg 
      width="140" 
      height="140" 
      viewBox="0 0 140 140" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M70 90.0005C82.4264 90.0005 92.5 79.9269 92.5 67.5005C92.5 55.0741 82.4264 45.0005 70 45.0005C57.5736 45.0005 47.5 55.0741 47.5 67.5005C47.5 79.9269 57.5736 90.0005 70 90.0005Z" 
        stroke={muiTheme.palette.primary.contrastText}
        strokeWidth="4.94118" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M110 135C106.214 127.655 100.479 121.494 93.4233 117.192C86.3675 112.891 78.2635 110.616 70 110.616C61.7365 110.616 53.6325 112.891 46.5767 117.192C39.5209 121.494 33.7857 127.655 30 135" 
        stroke={muiTheme.palette.primary.contrastText}
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M120 105.6C127.096 96.3443 131.461 85.2874 132.601 73.6799C133.741 62.0725 131.61 50.3778 126.449 39.9184C121.288 29.459 113.304 20.6523 103.399 14.4943C93.4937 8.3363 82.0632 5.07275 70.3999 5.07275C58.7367 5.07275 47.3061 8.3363 37.4011 14.4943C27.496 20.6523 19.5116 29.459 14.351 39.9184C9.19035 50.3778 7.05936 62.0725 8.19903 73.6799C9.3387 85.2874 13.7036 96.3443 20.7999 105.6" 
        stroke={muiTheme.palette.primary.contrastText}
        strokeWidth="6.58823" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  const handleContinue = () => {
    router.push("/paciente/onboarding/triagem/step1");
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/api/onboard", { chronicConditionIds: [], medications: [], allergies: "" }, "Erro ao salvar dados de onboarding");
      router.push("/paciente/onboarding/triagem/final");
    } catch {
      // Mesmo com erro, avança
      router.push("/paciente/onboarding/triagem/final");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: 4,
        gap: 3,
      }}
    >
      {/* Ícone de Perfil com Background Circular */}
      <Box
        sx={{
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          backgroundColor: 'primary.main',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ProfileIcon />
      </Box>

      {/* Título */}
      <Typography
        sx={{
          fontSize: { xs: "24px", sm: "28px", md: "32px" },
          fontWeight: 700,
          lineHeight: 1.2,
          textAlign: "center",
          maxWidth: "576px",
        }}
      >
        Vamos conhecer um pouco sobre você
      </Typography>

      {/* Texto Explicativo */}
      <Typography
        sx={{
          fontSize: { xs: "14px", sm: "16px" },
          fontWeight: 400,
          lineHeight: 1.6,
          textAlign: "center",
          maxWidth: "576px",
        }}
      >
        Conte um pouco sobre seu histórico de saúde — é rápido, seguro e faz toda
        a diferença no seu atendimento.
      </Typography>

      {/* Botões */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          width: "100%",
          justifyContent: 'center'
        }}
      >
        <Button
          variant="outlined"
          onClick={handleSkip}
          disabled={isSubmitting}
        >
          Pular
        </Button>

        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={isSubmitting}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
}

