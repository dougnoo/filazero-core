"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { authService } from "@/shared/services/authService";
import { getRouteByRole } from "@/shared/utils/roleRedirect";

const PRIVACY_ACCEPTANCE_KEY = "paciente_privacy_acceptance_completed";
const ONBOARDING_COMPLETED_KEY = "paciente_location_onboarding_completed";

export default function AuthenticatedRoot() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectByRole = async () => {
      try {
        // Busca o perfil do usuário para obter a role
        const userProfile = await authService.getUserProfile();
        const role = userProfile.role;
        
        // Obtém a rota baseada na role
        const route = getRouteByRole(role);
        
        // Se for paciente e primeiro acesso, verifica o onboarding
        if (route === '/paciente') {
          // Verifica se é primeiro acesso usando a flag do localStorage (definida quando NEW_PASSWORD_REQUIRED)
          const isFirstLogin = localStorage.getItem("user_is_first_login") === "true";
          
          if (isFirstLogin) {
            // Verifica o onboarding de localização
            const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
            
            if (hasCompletedOnboarding !== "true") {
              router.replace("/paciente/onboarding/location");
              return;
            }

            // Verifica o aceite de política de privacidade
            const hasAcceptedPrivacy = localStorage.getItem(PRIVACY_ACCEPTANCE_KEY);
            
            if (hasAcceptedPrivacy !== "true") {
              router.replace("/paciente/onboarding/privacy-acceptance");
              return;
            }

            // Verifica se já completou a triagem
            const hasCompletedTriagem = localStorage.getItem("paciente_triagem_final_completed");
            
            if (hasCompletedTriagem !== "true") {
              // Verifica se completou a introdução da triagem
              const hasCompletedIntro = localStorage.getItem("paciente_triagem_intro_completed");
              if (hasCompletedIntro !== "true") {
                router.replace("/paciente/onboarding/triagem-intro");
                return;
              } else {
                // Verifica qual step da triagem está
                const step1 = localStorage.getItem("paciente_triagem_step1_completed");
                const step2 = localStorage.getItem("paciente_triagem_step2_completed");
                const step3 = localStorage.getItem("paciente_triagem_step3_completed");
                
                if (step1 !== "true") {
                  router.replace("/paciente/onboarding/triagem/step1");
                  return;
                } else if (step2 !== "true") {
                  router.replace("/paciente/onboarding/triagem/step2");
                  return;
                } else if (step3 !== "true") {
                  router.replace("/paciente/onboarding/triagem/step3");
                  return;
                } else {
                  router.replace("/paciente/onboarding/triagem/final");
                  return;
                }
              }
            }
          }
        }
        
        // Redireciona para a rota correspondente
        router.replace(route);
      } catch (error) {
        // Em caso de erro, redireciona para paciente como fallback
        router.replace('/paciente');
      } finally {
        setIsLoading(false);
      }
    };

    redirectByRole();
  }, [router]);

  // Mostra loading enquanto verifica a role
  if (isLoading) {
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

  return null;
}