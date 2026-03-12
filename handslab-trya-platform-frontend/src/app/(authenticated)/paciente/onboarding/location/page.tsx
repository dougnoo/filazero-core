"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@/shared/hooks/useTheme";

const ONBOARDING_COMPLETED_KEY = "paciente_location_onboarding_completed";

export default function LocationOnboardingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const primaryColor = theme?.colors?.primary || "#F4B840";
  const secondaryColor = theme?.colors?.secondary || "#041616";
  const backgroundColor = theme?.colors?.background || "#FFFFFF";
  const fontFamily = theme?.typography?.fontFamily || "Inter, sans-serif";

  // Componente SVG de Localização
  const LocationIcon = () => (
    <svg 
      width="140" 
      height="140" 
      viewBox="0 0 140 140" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M115 50C115 74.9 70 135 70 135C70 135 25 74.9 25 50C25 38.0653 29.7411 26.6193 38.1802 18.1802C46.6193 9.74106 58.0653 5 70 5C81.9347 5 93.3807 9.74106 101.82 18.1802C110.259 26.6193 115 38.0653 115 50V50Z" 
        stroke={secondaryColor}
        strokeWidth="6.58823" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M70 65C78.2843 65 85 58.2843 85 50C85 41.7157 78.2843 35 70 35C61.7157 35 55 41.7157 55 50C55 58.2843 61.7157 65 70 65Z" 
        stroke={secondaryColor}
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  useEffect(() => {
    // Verifica se já completou o onboarding
    const hasCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (hasCompleted === "true") {
      // Redireciona para o próximo passo: Privacy Acceptance
      router.push("/paciente/onboarding/privacy-acceptance");
    }
  }, [router]);

  const handleActivateLocation = async () => {
    setIsRequestingLocation(true);
    
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Salva as coordenadas de geolocalização
            const coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
            };
            localStorage.setItem("paciente_geolocation_coordinates", JSON.stringify(coordinates));
            
            // Salva a preferência de localização
            localStorage.setItem("paciente_location_enabled", "true");
            localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
            router.push("/paciente/onboarding/privacy-acceptance");
          },
          () => {
            // Erro ao obter localização
            // Mesmo com erro, marca como completado para não ficar travado
            localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
            router.push("/paciente/onboarding/privacy-acceptance");
          }
        );
      } else {
        // Navegador não suporta geolocalização
        localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
        router.push("/paciente");
      }
    } catch {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      router.push("/paciente");
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleContinueWithoutActivating = () => {
    localStorage.setItem("paciente_location_enabled", "false");
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    router.push("/paciente/onboarding/privacy-acceptance");
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
      {/* Ícone de Localização com Background Circular */}
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
        <LocationIcon />
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
        Ative sua localização para uma experiência personalizada
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
        Com a geolocalização ativa, você encontra unidades, médicos e serviços
        próximos de onde estiver. Suas informações são usadas apenas para
        oferecer recomendações mais precisas.
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
          onClick={handleContinueWithoutActivating}
          disabled={isRequestingLocation}
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
          Continuar sem ativar*
        </Button>

        <Button
          variant="contained"
          onClick={handleActivateLocation}
          disabled={isRequestingLocation}
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
          {isRequestingLocation ? "Ativando..." : "Ativar localização"}
        </Button>
      </Box>

      {/* Disclaimer */}
      <Typography
        sx={{
          fontSize: "12px",
          fontWeight: 400,
          color: secondaryColor,
          fontFamily: fontFamily,
          textAlign: "center",
        }}
      >
        *Você poderá ativar depois nas configurações
      </Typography>
    </Box>
  );
}

