"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { OnboardingProvider, useOnboarding } from "@/shared/context/OnboardingContext";
import { getRouteByRole } from "@/shared/utils/roleRedirect";

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isOnboarded, isLoading, userProfile } = useOnboarding();

  useEffect(() => {
    if (!isLoading && isOnboarded) {
      const route = getRouteByRole(userProfile?.role);
      router.replace(route);
    }
  }, [isOnboarded, isLoading, userProfile?.role, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Carregando...</Typography>
      </Box>
    );
  }

  if (isOnboarded) {
    return null; // Será redirecionado
  }

  return <>{children}</>;
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <OnboardingGuard>{children}</OnboardingGuard>
    </OnboardingProvider>
  );
}
