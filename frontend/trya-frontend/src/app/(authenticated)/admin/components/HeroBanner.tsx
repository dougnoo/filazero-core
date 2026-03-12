"use client";

import Image from "next/image";
import { Box } from "@mui/material";
import { buildAssetUrl } from "@/shared/theme/createTenantTheme";

export function HeroBanner() {
  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          width: "100%",
          borderRadius: { xs: "16px", md: "20px" },
          overflow: "hidden",
        }}
      >
        <Image
          src={buildAssetUrl('theme/admin/banner_dashboard.png')}
          alt="Banner do painel administrativo"
          width={1200}
          height={280}
          priority
          sizes="(min-width: 1200px) 1200px, 100vw"
          style={{ 
            width: "100%", 
            height: "auto",
            display: "block",
          }}
        />
      </Box>
    </Box>
  );
}
