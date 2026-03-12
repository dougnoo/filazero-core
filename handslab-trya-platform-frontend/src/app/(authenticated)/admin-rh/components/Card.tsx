// components/Card.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Box, Button, Typography, ButtonProps, SxProps, Theme } from "@mui/material";

export type FeatureCardPalette = {
  background: string;
  iconBackground: string;
  iconColor: string;
  divider: string;
  textPrimary: string;
  textSecondary: string;
  buttonBackground: string;
  buttonText: string;
};

export const defaultPalette: FeatureCardPalette = {
  background: "#FBF1E7",
  iconBackground: "#F6C400",
  iconColor: "#041616",
  divider: "#602F14",
  textPrimary: "#041616",
  textSecondary: "#041616",
  buttonBackground: "#FAB900",
  buttonText: "#2F3237",
};

export type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
  palette?: Partial<FeatureCardPalette>;
  sx?: SxProps<Theme>;
  ButtonProps?: Omit<ButtonProps, "children" | "onClick">;
};

export const FeatureCard = React.memo(function FeatureCard({
  title,
  description,
  icon,
  actionLabel = "Acessar",
  href,
  onAction,
  palette: custom = {},
  sx,
  ButtonProps,
}: FeatureCardProps) {
  const palette = { ...defaultPalette, ...custom };

  const interactiveProps = React.useMemo(() => {
    if (href) return { component: Link as typeof Link, href };
    if (onAction) return { onClick: onAction };
    return {};
  }, [href, onAction]);

  return (
    <Box
      role="region"
      aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-title`}
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: palette.background,
        borderRadius: "12px",
        boxShadow: "0px 8px 24px rgba(6,36,36,0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      {/* TOPO */}
      <Box
        sx={{
          boxSizing: "border-box",
          height: { xs: "auto", sm: 120 },
          px: { xs: 2, sm: 3 },         // 16 / 24
          py: { xs: 2, sm: 2 },         // 16 / 16
          borderBottom: `2px solid ${palette.divider}`,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Ícone */}
        <Box
          aria-hidden
          sx={{
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            borderRadius: "50%",
            bgcolor: palette.iconBackground,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: { xs: "0 0 48px", sm: "0 0 56px" },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography
            id={`${title.replace(/\s+/g, "-").toLowerCase()}-title`}
            component="h2"
            sx={{
              fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "18px", sm: "20px" },
              lineHeight: { xs: "26px", sm: "28px" },
              color: palette.textPrimary,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
              fontSize: { xs: "14px", sm: "16px" },
              lineHeight: { xs: "22px", sm: "24px" },
              color: palette.textSecondary,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      {/* BASE */}
      <Box
        sx={{
          height: { xs: "auto", sm: 88 },
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 0 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: { xs: "flex-start", sm: "flex-end" },
          gap: { xs: 2, sm: 0 },
          backgroundColor: "#FFFFFF",
        }}
      >
        <Button
          aria-label={actionLabel}
          variant="contained"
          disableElevation
          sx={{
            height: 40,
            borderRadius: "8px",
            px: 2,
            minWidth: "auto",
            fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "20px",
            textTransform: "none",
            bgcolor: palette.buttonBackground,
            color: palette.buttonText,
            boxShadow: "none",
            mt: { xs: 0, sm: 0 },
            width: { xs: "100%", sm: "auto" },
            "&:hover": {
              bgcolor: palette.buttonBackground,
              boxShadow: "0px 8px 16px rgba(250,185,0,0.24)",
            },
          }}
          {...interactiveProps}
          {...ButtonProps}
        >
          {actionLabel}
        </Button>
      </Box>
    </Box>
  );
});
