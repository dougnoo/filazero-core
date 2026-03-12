"use client";

import { ReactNode } from "react";
import { Box, Typography, Alert, AlertProps } from "@mui/material";
import BackButton from "@/shared/components/BackButton";

interface ListingPageLayoutProps {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  error?: string | null;
  success?: string | null;
  maxWidth?: number | string;
}

export function ListingPageLayout({
  title,
  children,
  onBack,
  error,
  success,
  maxWidth = 1200,
}: ListingPageLayoutProps) {
  return (
    <Box sx={{ maxWidth, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
      <BackButton variant="icon-only" onClick={onBack} />

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "24px", md: "28px" },
          mb: 3,
        }}
      >
        {title}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {children}
    </Box>
  );
}
