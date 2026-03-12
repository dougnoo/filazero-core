"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { authService } from "@/shared/services/authService";
import { getRouteByRole } from "@/shared/utils/roleRedirect";

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

        if (route === '/paciente') {
          // onboardedAt do backend é a fonte de verdade
          const needsOnboarding = !userProfile.onboardedAt;

          if (needsOnboarding) {
            router.replace("/paciente/onboarding/location");
            return;
          }
        }

        router.replace(route);
      } catch {
        router.replace('/paciente');
      } finally {
        setIsLoading(false);
      }
    };

    redirectByRole();
  }, [router]);

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