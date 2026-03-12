"use client";

import { Box, Typography } from "@mui/material";

export interface MedicalHistoryData {
  conditions?: string[];
  medications?: Array<{ name: string; dosage?: string }>;
  allergies?: string[];
}

interface MedicalHistoryCardProps {
  history: MedicalHistoryData;
  title?: string;
}

export function MedicalHistoryCard({ history, title = "Histórico médico" }: MedicalHistoryCardProps) {
  const hasData = 
    (history.conditions && history.conditions.length > 0) ||
    (history.medications && history.medications.length > 0) ||
    (history.allergies && history.allergies.length > 0);

  if (!hasData) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: "12px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        p: 3,
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "16px",
           
          mb: 2,
        }}
      >
        {title}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {history.conditions && history.conditions.length > 0 && (
          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                 
                mb: 1,
              }}
            >
              Condições
            </Typography>
            {history.conditions.map((condition, index) => (
              <Typography
                key={index}
                sx={{ fontSize: "14px", color: "grey.800" }}
              >
                {condition}
              </Typography>
            ))}
          </Box>
        )}

        {history.medications && history.medications.length > 0 && (
          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                 
                mb: 1,
              }}
            >
              Medicamentos
            </Typography>
            {history.medications.map((med, index) => (
              <Typography
                key={index}
                sx={{ fontSize: "14px", color: "grey.800" }}
              >
                {med.name} {med.dosage || ""}
              </Typography>
            ))}
          </Box>
        )}

        {history.allergies && history.allergies.length > 0 && (
          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                 
                mb: 1,
              }}
            >
              Alergias
            </Typography>
            {history.allergies.map((allergy, index) => (
              <Typography
                key={index}
                sx={{ fontSize: "14px", color: "grey.800" }}
              >
                {allergy}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

