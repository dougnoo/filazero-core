"use client";

import * as React from "react";
import Link from "next/link";
import { Box, Button, Typography, ButtonProps, SxProps, Theme } from "@mui/material";

export type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
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
  sx,
  ButtonProps,
}: FeatureCardProps) {
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
        bgcolor: "secondary.light",
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
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2 },
          borderBottom: 2,
          borderColor: "primary.main",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            borderRadius: "50%",
            bgcolor: "primary.main",
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
              fontWeight: 700,
              fontSize: { xs: "18px", sm: "20px" },
              lineHeight: { xs: "26px", sm: "28px" },
              color: "secondary.contrastText",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "14px", sm: "16px" },
              lineHeight: { xs: "22px", sm: "24px" },
            }}
            color="secondary.contrastText"
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
          bgcolor: "white",
        }}
      >
        <Button
          aria-label={actionLabel}
          variant="contained"
          {...interactiveProps}
          {...ButtonProps}
        >
          {actionLabel}
        </Button>
      </Box>
    </Box>
  );
});
