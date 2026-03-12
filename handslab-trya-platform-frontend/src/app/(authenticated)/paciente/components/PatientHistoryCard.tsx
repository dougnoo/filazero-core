"use client";

import { Box, Typography, Chip } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { ReactNode } from "react";
import { ConditionsIcon, MedicationIcon, AllergiesIcon } from "./PatientHistoryIcons";
import { PatientData } from "./PatientCard";

// Interfaces para tipagem
export interface InfoCardSection {
  icon: ReactNode;
  title: string;
  items: string[];
}

export interface InfoCardProps {
  title: string;
  sections: InfoCardSection[];
  id?: string;
}

export function InfoCard({ title, sections, id }: InfoCardProps) {
  const theme = useThemeColors();
  
  return (
    <Box
      {...(id && { id })}
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
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          height: "1px",
          backgroundColor: theme.softBorder,
        }}
      />

      <Box 
        sx={{ 
          p: { xs: "20px 20px 20px 20px", md: "24px 0px 24px 24px" }, 
          display: "flex", 
          flexDirection: "column", 
          gap: { xs: "20px", md: "24px" } 
        }}
      >
        {sections.map((section, sectionIndex) => (
          <Box key={sectionIndex} sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {section.icon}
              <Typography sx={{ color: theme.textMuted, fontSize: "14px" }}>
                {section.title}
              </Typography>
            </Box>

            {section.items.length > 0 ? (
              <Box sx={{ display: "flex", gap: { xs: "8px", md: "8px" }, flexWrap: "wrap" }}>
                {section.items.map((item, itemIndex) => (
                  <Chip
                    key={itemIndex}
                    label={item}
                    sx={{
                      bgcolor: theme.chipBackground, // Sempre usa opacidade 0.30 da cor primária
                      color: theme.textDark,
                      fontWeight: 500,
                      fontSize: { xs: "13px", md: "14px" },
                      height: { xs: "30px", md: "32px" },
                      borderRadius: "9999px",
                      px: { xs: "10px", md: "12px" },
                      "& .MuiChip-label": {
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      },
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography 
                sx={{ 
                  color: theme.textMuted, 
                  fontSize: "13px",
                  fontStyle: "italic",
                }}
              >
                Nenhum registro
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

interface PatientHistoryCardProps {
  patientData?: PatientData | null;
  isLoading?: boolean;
}

export function PatientHistoryCard({ patientData, isLoading = false }: PatientHistoryCardProps) {
  // Processa alergias - pode ser string ou array
  const allergies = patientData?.allergies
    ? patientData.allergies.trim() !== ""
      ? [patientData.allergies]
      : []
    : [];

  // Processa condições crônicas
  const conditions = patientData?.chronicConditions
    ? patientData.chronicConditions.map((c) => c.name)
    : [];

  // Processa medicamentos
  const medications = patientData?.medications
    ? patientData.medications.map((m) => m.name)
    : [];

  return (
    <InfoCard
      id="patient-history-card"
      title="Histórico do paciente"
      sections={[
        {
          icon: <ConditionsIcon />,
          title: "Condições pré-existentes",
          items: isLoading ? [] : conditions
        },
        {
          icon: <MedicationIcon />,
          title: "Medicamentos em uso",
          items: isLoading ? [] : medications
        },
        {
          icon: <AllergiesIcon />,
          title: "Alergias",
          items: isLoading ? [] : allergies
        }
      ]}
    />
  );
}

