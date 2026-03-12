"use client";

import { Box, Typography } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useTheme } from "@/shared/hooks/useTheme";

interface ClinicalHistoryEntry {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
}

interface ClinicalHistoryCardProps {
  entries?: ClinicalHistoryEntry[];
}

export function ClinicalHistoryCard({ entries }: ClinicalHistoryCardProps) {
  const theme = useThemeColors();
  const { theme: currentTheme } = useTheme();
  const isDefaultTheme = currentTheme?.id === 'default';
  
  // Dados mockados caso não tenha entradas
  const defaultEntries: ClinicalHistoryEntry[] = entries || [
    {
      id: "1",
      doctorName: "Dr. Ana Silva",
      specialty: "Cardiologista",
      date: "24/10/2025",
    },
    {
      id: "2",
      doctorName: "Dr. Ana Silva",
      specialty: "Cardiologista",
      date: "13/10/2025",
    },
  ];

  return (
    <Box
      id="clinical-history-card"
      sx={{
        width: "100%",
        bgcolor: '#FFFFFF',
        borderRadius: { xs: "16px", md: "8px" },
        border: { xs: `1px solid ${theme.softBorder}`, md: "none" },
        display: "flex",
        flexDirection: "column",
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Título */}
      <Box sx={{ p: { xs: "16px 20px 0 20px", md: "12px 24px 0 24px" } }}>
        <Typography
          sx={{
            fontSize: { xs: "15px", md: "16px" },
            fontWeight: 600,
            color: theme.textDark,
            lineHeight: "24px",
            letterSpacing: "-0.4px",
            pb: "12px",
          }}
        >
          Histórico clínico
        </Typography>
      </Box>

      {/* Linha divisória */}
      <Box
        sx={{
          width: "100%",
          height: "1px",
          backgroundColor: theme.softBorder,
        }}
      />

      {/* Lista de entradas */}
      <Box
        sx={{
          p: { xs: "20px", md: "24px" },
          display: "flex",
          flexDirection: "column",
          gap: { xs: "12px", md: "12px" },
        }}
      >
        {defaultEntries.map((entry) => (
          <Box
            key={entry.id}
            sx={{
              bgcolor: isDefaultTheme ? theme.chipBackground : theme.backgroundSoft,
              borderRadius: "8px",
              p: { xs: "12px", md: "16px" },
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "14px", md: "15px" },
                fontWeight: 600,
                color: theme.textDark,
                fontFamily: theme.fontFamily,
              }}
            >
              {entry.doctorName}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "13px", md: "14px" },
                fontWeight: 400,
                color: theme.textMuted,
                fontFamily: theme.fontFamily,
              }}
            >
              {entry.specialty} • {entry.date}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

