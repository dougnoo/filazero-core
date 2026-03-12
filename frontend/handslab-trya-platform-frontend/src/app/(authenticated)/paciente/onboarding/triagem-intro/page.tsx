"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@/shared/hooks/useTheme";

const TRIAGEM_INTRO_COMPLETED_KEY = "paciente_triagem_intro_completed";

export default function TriagemIntroPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const primaryColor = theme?.colors?.primary || "#F4B840";
  const secondaryColor = theme?.colors?.secondary || "#041616";
  const backgroundColor = theme?.colors?.background || "#FFFFFF";
  const fontFamily = theme?.typography?.fontFamily || "Inter, sans-serif";

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
        stroke={secondaryColor}
        strokeWidth="4.94118" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M110 135C106.214 127.655 100.479 121.494 93.4233 117.192C86.3675 112.891 78.2635 110.616 70 110.616C61.7365 110.616 53.6325 112.891 46.5767 117.192C39.5209 121.494 33.7857 127.655 30 135" 
        stroke={secondaryColor}
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M120 105.6C127.096 96.3443 131.461 85.2874 132.601 73.6799C133.741 62.0725 131.61 50.3778 126.449 39.9184C121.288 29.459 113.304 20.6523 103.399 14.4943C93.4937 8.3363 82.0632 5.07275 70.3999 5.07275C58.7367 5.07275 47.3061 8.3363 37.4011 14.4943C27.496 20.6523 19.5116 29.459 14.351 39.9184C9.19035 50.3778 7.05936 62.0725 8.19903 73.6799C9.3387 85.2874 13.7036 96.3443 20.7999 105.6" 
        stroke={secondaryColor}
        strokeWidth="6.58823" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  useEffect(() => {
    // Verifica se já completou a introdução
    const hasCompleted = localStorage.getItem(TRIAGEM_INTRO_COMPLETED_KEY);
    if (hasCompleted === "true") {
      router.push("/paciente/onboarding/triagem/step1");
    }
  }, [router]);

  const handleContinue = () => {
    localStorage.setItem(TRIAGEM_INTRO_COMPLETED_KEY, "true");
    router.push("/paciente/onboarding/triagem/step1");
  };

  const handleSkip = () => {
    localStorage.setItem(TRIAGEM_INTRO_COMPLETED_KEY, "true");
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
      {/* Ícone de Perfil com Background Circular */}
      <Box
        sx={{
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          backgroundColor: primaryColor,
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
          color: secondaryColor,
          fontFamily: fontFamily,
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
          color: secondaryColor,
          fontFamily: fontFamily,
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
          Continuar
        </Button>
      </Box>
    </Box>
  );
}

