"use client";

import { Box, Typography, Paper } from "@mui/material";
import { ReactNode } from "react";

interface ContentSectionProps {
  title: string;
  children: ReactNode;
  highlight?: boolean;
}

export function ContentSection({ title, children, highlight = false }: ContentSectionProps) {
  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: "12px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        bgcolor: highlight ? "grey.50" : "background.paper",
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "18px",
           
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
  return (
    <Box>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "16px",
           
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          color: "grey.800",
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
  return (
    <ContentSection title={title} highlight>
      {description && (
        <Typography
          sx={{
            fontSize: "14px",
            color: "grey.800",
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
            color: "grey.800",
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

