"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { ServicesGrid } from "./components/ServicesGrid";
import { PatientCard, PatientData } from "./components/PatientCard";
import { PatientHistoryCard } from "./components/PatientHistoryCard";
import { ClinicalHistoryCard } from "./components/ClinicalHistoryCard";
import { WelcomeSection } from "./components/WelcomeSection";
import { OnboardingTour } from "./components/OnboardingTour";
import { api } from "@/shared/services/api";

const PRIVACY_ACCEPTANCE_KEY = "paciente_privacy_acceptance_completed";
const ONBOARDING_COMPLETED_KEY = "paciente_location_onboarding_completed";

export default function PacientePage() {
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Verifica se é primeiro acesso usando a flag do localStorage (definida quando NEW_PASSWORD_REQUIRED)
        const isFirstLogin = localStorage.getItem("user_is_first_login") === "true";

        // Se não for primeiro login, vai direto para a home
        if (!isFirstLogin) {
          setIsCheckingOnboarding(false);
          return;
        }

        // Se for primeiro login, verifica o onboarding
        // 1. Verifica primeiro o onboarding de localização
        const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
        
        if (hasCompletedOnboarding !== "true") {
          // Redireciona para o onboarding de localização
          router.push("/paciente/onboarding/location");
          return;
        }

        // 2. Depois verifica o aceite de política de privacidade
        const hasAcceptedPrivacy = localStorage.getItem(PRIVACY_ACCEPTANCE_KEY);
        
        if (hasAcceptedPrivacy !== "true") {
          // Redireciona para o aceite de política de privacidade
          router.push("/paciente/onboarding/privacy-acceptance");
          return;
        }

        // Depois verifica se já completou a triagem
        const hasCompletedTriagem = localStorage.getItem("paciente_triagem_final_completed");
        
        if (hasCompletedTriagem !== "true") {
          // Verifica se completou a introdução da triagem
          const hasCompletedIntro = localStorage.getItem("paciente_triagem_intro_completed");
          if (hasCompletedIntro !== "true") {
            router.push("/paciente/onboarding/triagem-intro");
          } else {
            // Verifica qual step da triagem está
            const step1 = localStorage.getItem("paciente_triagem_step1_completed");
            const step2 = localStorage.getItem("paciente_triagem_step2_completed");
            const step3 = localStorage.getItem("paciente_triagem_step3_completed");
            
            if (step1 !== "true") {
              router.push("/paciente/onboarding/triagem/step1");
            } else if (step2 !== "true") {
              router.push("/paciente/onboarding/triagem/step2");
            } else if (step3 !== "true") {
              router.push("/paciente/onboarding/triagem/step3");
            } else {
              router.push("/paciente/onboarding/triagem/final");
            }
          }
          return;
        }

        setIsCheckingOnboarding(false);
      } catch (error) {
        // Em caso de erro, permite acesso à home
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [router]);

  // Busca dados do paciente da API /me
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoadingPatientData(true);
        const data = await api.get<PatientData>("/api/auth/me", "Erro ao buscar dados do paciente");
        setPatientData(data);
      } catch (error) {
        // Em caso de erro, mantém null para mostrar dados vazios
      } finally {
        setIsLoadingPatientData(false);
      }
    };

    // Só busca os dados se não estiver verificando onboarding
    if (!isCheckingOnboarding) {
      fetchPatientData();
    }
  }, [isCheckingOnboarding]);

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
        gap: { xs: 3, md: 3, lg: 4 },
        width: "100%",
        height: { xs: "auto", lg: "calc(100vh - 64px)" },
        minHeight: 0,
        maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ display: { xs: "block", lg: "none" }, order: 1 }}>
        <WelcomeSection />
      </Box>

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
        <PatientCard patientData={patientData} isLoading={isLoadingPatientData} />
        <PatientHistoryCard patientData={patientData} isLoading={isLoadingPatientData} />
        <ClinicalHistoryCard />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          order: { xs: 3, lg: 2 },
          height: "100%",
          minHeight: 0,
        }}
      >
        <Box sx={{ display: { xs: "none", lg: "block" }, flex: "0 0 auto" }}>
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

