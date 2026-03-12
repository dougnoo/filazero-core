"use client";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { HeroBanner } from "./components/HeroBanner";
import { FeatureCard } from "./components/Card";

const BeneficiariesGlyph: React.FC<{ stroke: string }> = ({ stroke }) => (
  <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden>
    <path
      d="M14 18C16.4853 18 18.5 15.9853 18.5 13.5C18.5 11.0147 16.4853 9 14 9C11.5147 9 9.5 11.0147 9.5 13.5C9.5 15.9853 11.5147 18 14 18Z"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 27.0001C21.2429 25.531 20.0958 24.2988 18.6847 23.4385C17.2735 22.5782 15.6527 22.1232 14 22.1232C12.3473 22.1232 10.7265 22.5782 9.31534 23.4385C7.90418 24.2988 6.75714 25.531 6 27.0001"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24.0001 21.12C25.4194 19.2688 26.2923 17.0574 26.5203 14.736C26.7482 12.4145 26.322 10.0755 25.2899 7.98365C24.2577 5.89177 22.6609 4.13043 20.6799 2.89883C18.6988 1.66723 16.4127 1.01453 14.0801 1.01453C11.7474 1.01453 9.46133 1.66723 7.48031 2.89883C5.4993 4.13043 3.90242 5.89177 2.8703 7.98365C1.83817 10.0755 1.41197 12.4145 1.6399 14.736C1.86784 17.0574 2.74081 19.2688 4.16008 21.12"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AtestadosGlyph: React.FC<{ stroke: string }> = ({ stroke }) => (
  <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden>
    <path
      d="M8 2H20C21.1046 2 22 2.89543 22 4V24C22 25.1046 21.1046 26 20 26H8C6.89543 26 6 25.1046 6 24V4C6 2.89543 6.89543 2 8 2Z"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 8H18"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 13H18"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 18H15"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default function AdminRhHomePage() {
  const theme = useTheme();
  
  return (
    <Box component="main" sx={{ gap: 2, display: 'flex', flexDirection: 'column' }} px={{ xs: 2, md: 0 }}>
      <HeroBanner />

      <Box
        display='flex'
        justifyContent='center'
        
        width='100%'
      >
        <Box
          component="section"
          sx={{
            maxWidth: 1200,
            width: "100%",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(320px, 1fr))",
            },
            justifyContent: "stretch",
            justifyItems: "stretch",
            gap: { xs: 2, md: 3 },
          }}
        >
        {/* Card 1 - Beneficiários */}
        <FeatureCard
          title="Beneficiários"
          description="Visualize, cadastre ou edite beneficiários. Sincronize dados sempre que precisar."
          icon={<BeneficiariesGlyph stroke={theme.palette.primary.contrastText} />}
          href="/admin-rh/beneficiarios"
        />

        {/* Card 2 - Atestados */}
        <FeatureCard
          title="Atestados"
          description="Visualize e acompanhe os atestados médicos enviados pelos funcionários da sua organização"
          icon={<AtestadosGlyph stroke={theme.palette.primary.contrastText} />}
          href="/admin-rh/atestados"
        />
        </Box>
      </Box>
    </Box>
  );
}
