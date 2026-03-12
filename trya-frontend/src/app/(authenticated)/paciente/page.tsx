"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { ServicesGrid } from "./components/ServicesGrid";
import { PatientCard } from "./components/PatientCard";
import { HealthDataCard } from "@/shared/components/HealthData";
import { WelcomeSection } from "./components/WelcomeSection";
import { PoweredByAICard } from "./components/PoweredByAICard";
import { OnboardingTour } from "./components/OnboardingTour";
import { authService } from "@/shared/services/authService";

export default function PacientePage() {
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const userProfile = await authService.getUserProfile();

        // onboardedAt do backend é a fonte de verdade
        const needsOnboarding = !userProfile.onboardedAt;

        if (needsOnboarding) {
          // Redireciona para o início do onboarding
          router.push("/paciente/onboarding/location");
          return;
        }

        setIsCheckingOnboarding(false);
      } catch {
        // Em caso de erro, permite acesso à home
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [router]);

  // Mostra loading enquanto verifica o onboarding
  if (isCheckingOnboarding) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <OnboardingTour />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: { xs: "stretch", lg: "flex-start" },
          gap: { xs: 3, md: 3, lg: 4 },
          width: "100%",
          height: { xs: "auto", lg: "calc(100vh - 64px)" },
          minHeight: 0,
          maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Coluna esquerda */}
        <Box
          sx={{
            width: { xs: "100%", lg: 320 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 3, md: 3 },
            height: { xs: "auto", lg: "calc(100vh - 64px)" },
            minHeight: 0,
            maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
            overflowY: { xs: "visible", lg: "auto" },
            overflowX: "hidden",
            order: { xs: 2, lg: 1 },
            pr: { lg: 1 },
            pb: { lg: 2 },
            pt: { lg: 0 },
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#9CA3AF",
              borderRadius: "3px",
              "&:hover": {
                bgcolor: "#6B7280",
              },
            },
          }}
        >
          {/* PoweredByAICard no topo da coluna esquerda */}
          <PoweredByAICard />
          <PatientCard />
          <HealthDataCard />
          {/* <ClinicalHistoryCard /> */}
        </Box>

        {/* Coluna direita */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            order: { xs: 3, lg: 2 },
            height: "100%",
            minHeight: 0,
            pt: { lg: 0 },
          }}
        >
          {/* WelcomeSection no topo da coluna direita */}
          <Box sx={{ flex: "0 0 auto", mb: 3 }}>
            <WelcomeSection />
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, overflow: "visible", pr: 1 }}>
            <ServicesGrid />
          </Box>
        </Box>
      </Box>
    </>
  );
}

