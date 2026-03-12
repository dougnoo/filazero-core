"use client";

import { Box } from "@mui/material";
import { HeroBanner } from "./components/HeroBanner";
import { FeatureCard } from "./components/Card";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

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

const CustomizeIcon: React.FC<{ stroke: string }> = ({ stroke }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
    <path
      d="M25.2801 3.74005L23.6001 8.70005C23.542 8.81476 23.5118 8.94151 23.5118 9.07005C23.5118 9.19859 23.542 9.32534 23.6001 9.44005L26.74 13.6401C26.8303 13.7603 26.8848 13.9035 26.8974 14.0533C26.91 14.203 26.8802 14.3533 26.8113 14.4869C26.7424 14.6205 26.6373 14.732 26.5079 14.8086C26.3786 14.8852 26.2303 14.9238 26.08 14.9201H20.8401C20.7116 14.9238 20.5857 14.9563 20.4715 15.0152C20.3573 15.074 20.2577 15.1577 20.1801 15.2601L17.2601 19.46C17.1744 19.5828 17.056 19.6791 16.9184 19.7379C16.7808 19.7968 16.6294 19.8158 16.4814 19.7929C16.3335 19.77 16.195 19.706 16.0816 19.6083C15.9682 19.5106 15.8845 19.383 15.8401 19.24L14.28 14.2401C14.2445 14.1165 14.1781 14.0039 14.0871 13.913C13.9962 13.822 13.8836 13.7556 13.7601 13.7201L8.76005 12.1601C8.61712 12.1156 8.48953 12.0319 8.3918 11.9185C8.29407 11.8051 8.2301 11.6666 8.20719 11.5187C8.18427 11.3707 8.20331 11.2193 8.26216 11.0817C8.321 10.9441 8.41728 10.8257 8.54005 10.7401L12.82 7.72005C12.9224 7.64242 13.0061 7.54284 13.0649 7.42863C13.1238 7.31442 13.1563 7.18847 13.16 7.06005V1.82005C13.1656 1.68242 13.2067 1.54856 13.2792 1.43144C13.3517 1.31432 13.4532 1.2179 13.5739 1.15152C13.6946 1.08514 13.8303 1.05104 13.9681 1.05254C14.1058 1.05403 14.2408 1.09107 14.36 1.16005L18.5601 4.30005C18.6667 4.37411 18.7894 4.42179 18.918 4.43917C19.0467 4.45656 19.1776 4.44315 19.3 4.40005L24.26 2.72005C24.4023 2.67006 24.5558 2.66128 24.7028 2.69473C24.8498 2.72818 24.9844 2.8025 25.091 2.90911C25.1976 3.01572 25.2719 3.15029 25.3054 3.29731C25.3388 3.44433 25.33 3.59781 25.2801 3.74005Z"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14.08 13.92L1 27" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const DiagnosticIcon: React.FC<{ stroke: string }> = ({ stroke }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26.7443 15.544V21.0881C26.7443 21.6296 26.3054 22.0685 25.764 22.0685H2.23642C1.695 22.0685 1.2561 21.6296 1.2561 21.0881V5.40311C1.2561 4.8617 1.695 4.42279 2.23642 4.42279H6.68458" stroke="#041616" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.0395 22.0688L10.0789 26.9704" stroke="#041616" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.9607 22.0688L17.9213 26.9704" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.11816 26.9702H19.8819" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.8638 1.17133H17.9615C18.2527 1.17133 18.5319 1.28699 18.7378 1.49286C18.9436 1.69873 19.0593 1.97796 19.0593 2.2691V5.27972C19.0593 6.44431 18.5966 7.56119 17.7732 8.38469C16.9496 9.20818 15.8328 9.67081 14.6682 9.67081C13.5037 9.67081 12.3867 9.20818 11.5632 8.38469C10.7397 7.56119 10.2771 6.44431 10.2771 5.27972V2.2691C10.2771 1.97796 10.3928 1.69873 10.5986 1.49286C10.8045 1.28699 11.0837 1.17133 11.3749 1.17133H12.4727" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24.5486 7.47544C25.7611 7.47544 26.7441 6.49246 26.7441 5.2799C26.7441 4.06734 25.7611 3.08435 24.5486 3.08435C23.3359 3.08435 22.353 4.06734 22.353 5.2799C22.353 6.49246 23.3359 7.47544 24.5486 7.47544Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.6682 9.6707V10.2196C14.6682 11.5297 15.1887 12.7862 16.115 13.7127C17.0414 14.6391 18.2979 15.1596 19.6081 15.1596C20.9183 15.1596 22.1748 14.6391 23.1012 13.7127C24.0277 12.7862 24.5481 11.5297 24.5481 10.2196V7.47516" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export default function AdminRhHomePage() {
  const theme = useThemeColors();
  
  return (
    <Box component="main" sx={{ pb: { xs: 6, md: 8 } }}>
      <HeroBanner />

      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, md: 2 },
          py: { xs: 4, md: 0 },
        }}
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
        {/* Card 1 */}
        <FeatureCard
          title="Beneficiários"
          description="Visualize, cadastre ou edite beneficiários. Sincronize dados sempre que precisar."
          icon={<BeneficiariesGlyph stroke={theme.textDark} />}
          href="/admin-rh/beneficiarios"
          palette={{
            background: theme.backgroundSoft,
            iconBackground: theme.iconBackground,
            divider: theme.primary,
            buttonBackground: theme.primary,
            buttonText: theme.secondary,
            textPrimary: theme.textDark,
            textSecondary: theme.textMuted,
            iconColor: theme.textDark,
          }}
        />

        {/* Card 2 (exemplo adicional) */}
        <FeatureCard
          title="Personalização"
          description="Gerencie cores, fundos e elementos visuais para adaptar o ambiente às suas preferências."
          icon={<CustomizeIcon stroke={theme.textDark} />}
          href="/admin-rh/personalizacao"
          palette={{
            background: theme.backgroundSoft,
            iconBackground: theme.iconBackground,
            divider: theme.primary,
            buttonBackground: theme.primary,
            buttonText: theme.secondary,
            textPrimary: theme.textDark,
            textSecondary: theme.textMuted,
            iconColor: theme.textDark,
          }}
        />


        {/* Card 2 (exemplo adicional) */}
        <FeatureCard
          title="Atestados"
          description="Acompanhe, valide e gerencie todos os atestados enviados pela equipe."
          icon={<DiagnosticIcon stroke={theme.textDark} />}
          href="/admin-rh/atestados"
          palette={{
            background: theme.backgroundSoft,
            iconBackground: theme.iconBackground,
            divider: theme.primary,
            buttonBackground: theme.primary,
            buttonText: theme.secondary,
            textPrimary: theme.textDark,
            textSecondary: theme.textMuted,
            iconColor: theme.textDark,
          }}
        />
        </Box>
      </Box>
    </Box>
  );
}
