'use client';

import { Box, Typography, Chip } from '@mui/material';
import { HealthData } from '../../lib/types';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { ConditionsIcon, MedicationIcon, AllergiesIcon } from '../../../components/PatientHistoryIcons';

export default function HealthDataCards({ health }: { health: HealthData }) {
  const theme = useThemeColors();
  
  const sections = [
    {
      icon: <ConditionsIcon />,
      title: "Condições pré-existentes",
      items: health.conditions || []
    },
    {
      icon: <MedicationIcon />,
      title: "Medicamentos em uso",
      items: health.meds || []
    },
    {
      icon: <AllergiesIcon />,
      title: "Alergias",
      items: health.allergies || []
    }
  ];

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: '#FFFFFF',
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        fontFamily: theme.fontFamily,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      <Box sx={{ p: "12px 24px 0 24px" }}>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            color: theme.textDark,
            lineHeight: "24px",
            letterSpacing: "-0.4px",
            pb: "12px",
          }}
        >
          Dados de saúde
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
          p: "24px 0px 24px 24px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "24px" 
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
              <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {section.items.map((item, itemIndex) => (
                  <Chip
                    key={itemIndex}
                    label={item}
                    sx={{
                      bgcolor: theme.chipBackground,
                      color: theme.textDark,
                      fontWeight: 500,
                      fontSize: "14px",
                      height: "32px",
                      borderRadius: "9999px",
                      px: "12px",
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
