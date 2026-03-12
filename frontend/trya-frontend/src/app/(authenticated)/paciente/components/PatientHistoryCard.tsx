"use client";

import { Box, Typography, Chip, Collapse, IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ReactNode } from "react";
import {
  ConditionsIcon,
  MedicationIcon,
  AllergiesIcon,
} from "./PatientHistoryIcons";
import { usePatientData } from "@/shared/hooks/usePatientData";
import { useCollapsibleOnMobile } from "@/shared/hooks/useCollapsibleOnMobile";

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
  const { expanded, handleToggle, isContentVisible } = useCollapsibleOnMobile();
  
  return (
    <Box
      {...(id && { id })}
      sx={{
        width: "100%",
        bgcolor: 'background.paper',
        borderRadius: { xs: "16px", md: "8px" },
        border: { xs: 1, md: "none" },
        borderColor: { xs: 'divider', md: 'transparent' },
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header - Clickable on mobile */}
      <Box 
        onClick={handleToggle}
        sx={{ 
          p: { xs: "16px 20px", md: "12px 24px 0 24px" },
          cursor: { xs: "pointer", lg: "default" },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "15px", md: "16px" },
            fontWeight: 600,
            lineHeight: "24px",
            letterSpacing: "-0.4px",
            pb: { xs: 0, md: "12px" },
          }}
        >
          {title}
        </Typography>

        {/* Chevron icon - only on mobile */}
        <Box sx={{ display: { xs: "flex", lg: "none" } }}>
          <IconButton
            size="small"
            sx={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <KeyboardArrowDownIcon sx={{ color: "grey.600" }} />
          </IconButton>
        </Box>
      </Box>

      {/* Collapsible content on mobile, always visible on desktop */}
      <Collapse in={isContentVisible} timeout="auto">
        <Box
          sx={{
            width: "100%",
            height: "1px",
            bgcolor: 'divider',
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
                <Typography sx={{ color: 'gray.800', fontSize: "14px" }}>
                  {section.title}
                </Typography>
              </Box>

              {section.items.length > 0 ? (
                <Box sx={{ display: "flex", gap: { xs: "8px", md: "8px" }, flexWrap: "wrap" }}>
                  {section.items.map((item, itemIndex) => (
                    <Chip
                      key={itemIndex}
                      label={item}
                      color="secondary"
                      variant="filled"
                    />
                  ))}
                </Box>
              ) : (
                <Typography 
                  sx={{ 
                    color: 'gray.800', 
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
      </Collapse>
    </Box>
  );
}

export function PatientHistoryCard() {
  const { data: patientData, isLoading } = usePatientData();

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
      title="Dados de saúde"
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

