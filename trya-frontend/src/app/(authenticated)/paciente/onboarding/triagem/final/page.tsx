"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { useOnboarding } from "@/shared/context/OnboardingContext";

const OnboardingFinalIcon = ({ bgColor, iconColor }: { bgColor: string; iconColor: string }) => (
  <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="120" r="120" fill={bgColor} />
    <g transform="translate(50, 50)">
      <path d="M133.72 77.7204V105.441C133.72 108.148 131.526 110.343 128.819 110.343H11.1809C8.4738 110.343 6.2793 108.148 6.2793 105.441V27.0158C6.2793 24.3088 8.4738 22.1143 11.1809 22.1143H33.4217" stroke={iconColor} strokeWidth="6.58823" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M60.1977 110.345L50.3945 134.852" stroke={iconColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M79.8047 110.345L89.6076 134.852" stroke={iconColor} strokeWidth="4.94118" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40.5918 134.851H99.4105" stroke={iconColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M84.3201 5.85645H89.8087C91.2647 5.85645 92.6606 6.43476 93.6902 7.46411C94.7192 8.49346 95.2978 9.88961 95.2978 11.3453V26.3984C95.2978 32.2214 92.9843 37.8058 88.8672 41.9232C84.7494 46.0407 79.1652 48.3539 73.3423 48.3539C67.5195 48.3539 61.9347 46.0407 57.8173 41.9232C53.6999 37.8058 51.3867 32.2214 51.3867 26.3984V11.3453C51.3867 9.88961 51.965 8.49346 52.9944 7.46411C54.0237 6.43476 55.4199 5.85645 56.8756 5.85645H62.3646" stroke={iconColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M122.743 37.3773C128.806 37.3773 133.721 32.4624 133.721 26.3996C133.721 20.3368 128.806 15.4219 122.743 15.4219C116.68 15.4219 111.766 20.3368 111.766 26.3996C111.766 32.4624 116.68 37.3773 122.743 37.3773Z" stroke={iconColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M73.3418 48.3537V51.0981C73.3418 57.6489 75.944 63.9313 80.5757 68.5635C85.208 73.1958 91.4905 75.798 98.0413 75.798C104.592 75.798 110.875 73.1958 115.507 68.5635C120.139 63.9313 122.741 57.6489 122.741 51.0981V37.376" stroke={iconColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  </svg>
);

export default function TriagemFinalPage() {
  const router = useRouter();
  const theme = useTheme();
  const { refreshProfile } = useOnboarding();

  const handleStart = async () => {
    // Atualiza o perfil para refletir o onboardedAt da API
    await refreshProfile();
    router.push("/paciente");
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
      {/* Container centralizado com largura fixa */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "576px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* Ícone com fundo redondo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            mb: { xs: 0, sm: 1 },
          }}
        >
          <OnboardingFinalIcon 
            bgColor={theme.palette.primary.main} 
            iconColor={theme.palette.primary.contrastText} 
          />
        </Box>

        {/* Título */}
        <Typography
          sx={{
            fontSize: { xs: "24px", sm: "28px", md: "32px" },
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: "center",
            width: "100%",
          }}
        >
          Tecnologia e cuidado
          <br />
          trabalhando para você
        </Typography>

        {/* Texto Explicativo */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
          }}
        >
        <Typography
          sx={{
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 400,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          Nossa plataforma utiliza inteligência artificial validada por médicos
          para apoiar decisões de triagem e direcionamento de cuidado.
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 400,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          Seus dados são analisados com segurança e confidencialidade.
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 400,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          Recomendações baseadas em dados clínicos avaliados por especialistas.
        </Typography>
      </Box>

        {/* Botão */}
        <Button
          variant="contained"
          onClick={handleStart}
          fullWidth
        >
          Começar agora
        </Button>
      </Box>
    </Box>
  );
}

