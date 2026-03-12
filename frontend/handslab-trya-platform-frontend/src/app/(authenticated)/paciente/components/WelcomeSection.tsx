"use client";

import { Box, Typography, Chip } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useTheme } from "@/shared/hooks/useTheme";

export function WelcomeSection() {
  const theme = useThemeColors();
  const { theme: currentTheme } = useTheme();
  const isDefaultTheme = currentTheme?.id === 'default';
  const chipBaseSx = {
    height: { xs: 28, md: 32 },
    borderRadius: "999px",
    border: `1px solid ${theme.primary}`,
    p: 0,
    boxShadow: "none",
    "& .MuiChip-label": {
      px: { xs: "10px", md: "12px" },
      py: { xs: "6px", md: "8px" },
      fontFamily: theme.fontFamily,
      fontSize: { xs: "11px", md: "12px" },
      lineHeight: { xs: "14px", md: "16px" },
      fontWeight: 400,
      whiteSpace: "nowrap",
    },
  } as const;

  return (
     <Box
       sx={{
         backgroundColor: isDefaultTheme ? theme.primary : theme.iconBackground,
         borderRadius: { xs: "16px", md: "16px" },
         p: { xs: "20px", sm: "24px", md: "40px 48px 32px 48px", lg: "56px 64px 40px 64px" },
         mb: { xs: 3, md: 4 },
         position: "relative",
         overflow: { xs: "hidden", md: "visible" },
         maxHeight: { xs: "auto", md: 280 },
         display: "flex",
         flexDirection: { xs: "column", md: "row" },
         justifyContent: "space-between",
         alignItems: { xs: "flex-start", md: "flex-start" },
         gap: { xs: 2.5, md: 4 },
       }}
     >
      {/* BG decorativo */}
      <Box 
        sx={{ 
          position: "absolute", 
          inset: 0, 
          zIndex: 0, 
          overflow: "hidden",
          opacity: { xs: 0.4, md: 1 },
          display: { xs: "none", md: "block" }
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 276"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="807.92" cy="45.357" r="129.08" stroke={theme.secondary} strokeWidth="3.369" />
          <circle cx="-19.8405" cy="25.8942" r="130.117" transform="rotate(-15.3455 -19.8405 25.8942)" stroke={theme.secondary} strokeWidth="3.369" />
          <circle cx="-78.1361" cy="136.645" r="113.304" transform="rotate(-15.3455 -78.1361 136.645)" stroke={theme.secondary} strokeWidth="3.369" />
        </svg>
      </Box>

      {/* Texto */}
      <Box
        sx={{
          flex: "1 1 auto",
          minWidth: 0,
          maxWidth: { xs: "100%", md: "80%", lg: "calc(100% - 340px)" },
          ml: { xs: 0, md: "70px", lg: "72px" },
          zIndex: 2,
        }}
      >
        <Typography
          component="h1"
          sx={{
            color: theme.textDark,
            fontWeight: 700,
            mb: { xs: 1.5, md: 1 },
            fontSize: { xs: "28px", md: "32px" },
            lineHeight: { xs: "34px", md: "38px" },
            letterSpacing: "-0.5px",
            fontFamily: theme.fontFamily,
          }}
        >
          Boas-vindas!
        </Typography>

        <Typography
          sx={{
            color: theme.textDark,
            mb: { xs: 2.5, md: 2 },
            fontSize: { xs: "15px", md: "16px" },
            lineHeight: { xs: "24px", md: "26px" },
            fontWeight: 400,
            fontFamily: theme.fontFamily,
            "& strong": { fontWeight: 700 },
          }}
        >
          Inteligência artificial <strong>a serviço da sua saúde</strong> — triagem, exames e
          telemedicina integrados.
        </Typography>

        {/* Chips ajustados para mobile */}
        <Box
          sx={{
            display: "flex",
            flexWrap: { xs: "wrap", md: "wrap" },
            columnGap: { xs: 1.5, md: 2 },
            rowGap: { xs: 1, md: 1 },
            maxWidth: "100%",
          }}
        >
          <Chip
            label="#HealthTech"
            sx={{
              ...chipBaseSx,
              backgroundColor: isDefaultTheme ? theme.secondary : theme.primary,
              color: isDefaultTheme ? theme.white : theme.white,
            }}
          />
          <Chip
            label="#InovaçãoMédica"
            sx={{
              ...chipBaseSx,
              color: theme.secondary,
            }}
          />
          <Chip
            label="#CuideDeVocê"
            sx={{
              ...chipBaseSx,
              color: theme.secondary,
            }}
          />
        </Box>
      </Box>

      {/* Imagem doutora (visível apenas acima de 1200px) */}
      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          display: { xs: "none", lg: "flex" },
          justifyContent: "flex-end",
          alignItems: "flex-start",
          overflow: "visible",
          flexShrink: 0,
          mr: { xs: "45px", lg: "70px" },
        }}
      >
        <Box
          component="img"
          src="/dashboard_doctor.png"
          alt="Médica"
          sx={{
            width: 240,
            height: 320,
            objectFit: "contain",
            transform: "translateY(-95px)",
            position: "relative",
            zIndex: 4,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </Box>
    </Box>
  );
}

