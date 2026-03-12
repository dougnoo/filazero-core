"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function LocationOnboardingPage() {
  const router = useRouter();
  const theme = useTheme();
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

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
        stroke={theme.palette.secondary.main}
        strokeWidth="6.58823" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M70 65C78.2843 65 85 58.2843 85 50C85 41.7157 78.2843 35 70 35C61.7157 35 55 41.7157 55 50C55 58.2843 61.7157 65 70 65Z" 
        stroke={theme.palette.secondary.main}
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  const handleActivateLocation = async () => {
    setIsRequestingLocation(true);
    
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {
            // Localização obtida com sucesso, avança para próximo passo
            router.push("/paciente/onboarding/privacy-acceptance");
          },
          () => {
            // Erro ao obter localização, mas continua o fluxo
            router.push("/paciente/onboarding/privacy-acceptance");
          }
        );
      } else {
        // Navegador não suporta geolocalização
        router.push("/paciente/onboarding/privacy-acceptance");
      }
    } catch {
      router.push("/paciente/onboarding/privacy-acceptance");
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleContinueWithoutActivating = () => {
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
        backgroundColor: 'background.default',
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
          backgroundColor: 'primary.main',
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
          color: 'grey.800',
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
          color="primary"
          onClick={handleContinueWithoutActivating}
          disabled={isRequestingLocation}
          sx={{
            flex: 1,
            height: { xs: "48px", sm: "52px" },
            fontSize: { xs: "14px", sm: "16px" }
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
            fontSize: { xs: "14px", sm: "16px" },
           
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
          color: 'grey.800',
          textAlign: "center",
        }}
      >
        *Você poderá ativar depois nas configurações
      </Typography>
    </Box>
  );
}

