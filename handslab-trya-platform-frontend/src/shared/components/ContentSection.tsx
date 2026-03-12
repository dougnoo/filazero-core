"use client";

import { Box, Typography, Paper } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { ReactNode } from "react";

interface ContentSectionProps {
  title: string;
  children: ReactNode;
  highlight?: boolean;
}

export function ContentSection({ title, children, highlight = false }: ContentSectionProps) {
  const theme = useThemeColors();

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: "12px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        bgcolor: highlight ? "#F9FAFB" : "white",
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "18px",
          color: theme.textDark,
          mb: 2,
        }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

interface ContentSubsectionProps {
  title: string;
  content: string;
}

export function ContentSubsection({ title, content }: ContentSubsectionProps) {
  const theme = useThemeColors();

  return (
    <Box>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "16px",
          color: theme.textDark,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          color: theme.textMuted,
          lineHeight: 1.6,
        }}
      >
        {content}
      </Typography>
    </Box>
  );
}

interface RecommendationSectionProps {
  title: string;
  description?: string;
  suggestions: string[];
}

export function RecommendationSection({ title, description, suggestions }: RecommendationSectionProps) {
  const theme = useThemeColors();

  return (
    <ContentSection title={title} highlight>
      {description && (
        <Typography
          sx={{
            fontSize: "14px",
            color: theme.textMuted,
            mb: 2,
          }}
        >
          {description}
        </Typography>
      )}
      <Box
        component="ul"
        sx={{
          pl: 2,
          m: 0,
          "& li": {
            fontSize: "14px",
            color: theme.textMuted,
            lineHeight: 1.6,
            mb: 1,
          },
        }}
      >
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </Box>
    </ContentSection>
  );
}

