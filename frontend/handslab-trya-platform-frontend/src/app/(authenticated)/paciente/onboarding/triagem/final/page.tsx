"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import { theme } from "@/shared/theme";

const TRIAGEM_FINAL_COMPLETED_KEY = "paciente_triagem_final_completed";

export default function TriagemFinalPage() {
  const router = useRouter();

  useEffect(() => {
    // Verifica se já completou a triagem
    const hasCompleted = localStorage.getItem(TRIAGEM_FINAL_COMPLETED_KEY);
    if (hasCompleted === "true") {
      router.push("/paciente");
    }
  }, [router]);

  const handleStart = () => {
    localStorage.setItem(TRIAGEM_FINAL_COMPLETED_KEY, "true");
    // Remove a flag de primeiro acesso, pois o onboarding foi completado
    localStorage.removeItem("user_is_first_login");
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
        backgroundColor: theme.background,
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
        {/* Imagem Geométrica */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            paddingRight: "2rem",
            paddingBottom: "2rem",
          }}
        >
          <Box
            component="img"
            src="/paciente/triangulo_inicio.png"
            alt="Tecnologia e Cuidado"
            sx={{
              width: "400px",
              height: "400px",
              "@media (max-width: 600px)": {
                width: "300px",
                height: "300px",
              },
            }}
          />
        </Box>

        {/* Título */}
        <Typography
          sx={{
            fontSize: { xs: "24px", sm: "28px", md: "32px" },
            fontWeight: 700,
            color: "#041616",
            fontFamily: theme.fontFamily,
            lineHeight: 1.2,
            textAlign: "center",
            width: "100%",
          }}
        >
          Tecnologia e cuidado
          <br />
          trabalhando por você
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
            color: "#041616",
            fontFamily: theme.fontFamily,
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
            color: "#041616",
            fontFamily: theme.fontFamily,
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
            color: "#041616",
            fontFamily: theme.fontFamily,
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
          sx={{
            height: { xs: "48px", sm: "52px" },
            backgroundColor: "#041616",
            color: theme.white,
            fontFamily: theme.fontFamily,
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#030F0F",
            },
          }}
        >
          Começar agora
        </Button>
      </Box>
    </Box>
  );
}

