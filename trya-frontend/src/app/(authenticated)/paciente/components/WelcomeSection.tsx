"use client";

import { Box, useMediaQuery } from "@mui/material";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";

export function WelcomeSection() {
  const { assets } = useTenantAssets();
  const isMobile = useMediaQuery
    ((theme) => theme.breakpoints.down("sm"));
  
  // URL do banner vem do tema do tenant (base64 retornado pelo backend)
  const bannerUrl = isMobile ? assets?.bannerDashboardMobile : assets?.bannerDashboard;

  // Se não há banner, não renderiza nada
  if (!bannerUrl) {
    return null;
  }

  return (
    <Box
      sx={{
        borderRadius: { xs: "16px", md: "16px" },
        mb: { xs: 0, md: 4 },
        overflow: "hidden",
        mx: { xs: 0 }
      }}
    >
      <Box
        component="img"
        src={bannerUrl}
        alt="Boas-vindas"
        sx={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
    </Box>
  );
}
