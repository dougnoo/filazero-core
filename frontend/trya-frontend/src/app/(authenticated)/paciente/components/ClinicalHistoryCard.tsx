"use client";

import { Box, Typography } from "@mui/material";

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
  const hasEntries = entries && entries.length > 0;

  return (
    <Box
      id="clinical-history-card"
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
      {/* Título */}
      <Box sx={{ p: { xs: "16px 20px 0 20px", md: "12px 24px 0 24px" } }}>
        <Typography
          sx={{
            fontSize: { xs: "15px", md: "16px" },
            fontWeight: 600,
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
          bgcolor: 'divider',
        }}
      />

      {/* Lista de entradas */}
      <Box
        sx={{
          p: { xs: "16px 20px", md: "20px 24px" },
          display: "flex",
          flexDirection: "column",
          gap: { xs: "10px", md: "12px" },
        }}
      >
        {hasEntries ? (
          entries.map((entry) => (
            <Box
              key={entry.id}
              sx={{
                bgcolor: "#FDF8F3", // Fundo bege conforme Figma
                borderRadius: "12px",
                p: { xs: "14px", md: "18px" },
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "14px", md: "16px" },
                  fontWeight: 600,
                  lineHeight: "22px",
                }}
              >
                {entry.doctorName}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "12px", md: "13px" },
                  fontWeight: 400,
                  color: "#6B7280", // Cor mais suave para subtítulo
                  lineHeight: "18px",
                }}
              >
                {entry.specialty} • {entry.date}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography
            sx={{
              fontSize: { xs: "13px", md: "14px" },
              fontWeight: 400,
              color: 'grey.800',
              textAlign: "center",
              py: 1,
            }}
          >
            Nenhum histórico clínico registrado
          </Typography>
        )}
      </Box>
    </Box>
  );
}

