"use client";

import { Box } from "@mui/material";

export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  backgroundColor?: string;
}

export function PageContainer({
  children,
  maxWidth = 1200,
  backgroundColor,
}: PageContainerProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)",
        py: { xs: 2, md: 4 },
        backgroundColor,
      }}
    >
      <Box
        sx={{
          maxWidth,
          width: "100%",
          px: { xs: 0, md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
