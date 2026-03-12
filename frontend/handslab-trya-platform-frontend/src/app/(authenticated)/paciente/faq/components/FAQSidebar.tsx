"use client";

import { Box } from "@mui/material";
import { PatientCard, PatientData } from "../../components/PatientCard";
import BackButton from "../../triagem/components/sidebar/BackButton";

interface FAQSidebarProps {
  patientData: PatientData | null;
  isLoadingPatientData: boolean;
}

export function FAQSidebar({
  patientData,
  isLoadingPatientData,
}: FAQSidebarProps) {
  return (
    <Box
      sx={{
        width: { xs: "100%", lg: 320 },
        display: "flex",
        flexDirection: "column",
        gap: { xs: 3, md: 3 },
        height: { xs: "auto", lg: "calc(100vh - 64px)" },
        minHeight: 0,
        maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
        overflowY: { xs: "visible", lg: "auto" },
        overflowX: "hidden",
        pr: { lg: 1 },
        pb: { lg: 2 },
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          bgcolor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "#9CA3AF",
          borderRadius: "3px",
          "&:hover": {
            bgcolor: "#6B7280",
          },
        },
      }}
    >
      {/* Botão Voltar */}
      <BackButton />

      {/* Patient Card */}
      <PatientCard
        patientData={patientData}
        isLoading={isLoadingPatientData}
      />
    </Box>
  );
}

