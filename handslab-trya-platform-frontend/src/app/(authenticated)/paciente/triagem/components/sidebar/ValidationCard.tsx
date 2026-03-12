'use client';

import { Box, Stack, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export default function ValidationCard() {
  const theme = useThemeColors();
  
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: theme.chipBackground,
        borderRadius: '8px',
        fontFamily: theme.fontFamily,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircle 
            sx={{ 
              color: theme.primary,
              fontSize: '20px',
            }} 
          />
          <Typography 
            sx={{
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '20px',
              color: theme.textDark,
              fontFamily: theme.fontFamily,
            }}
          >
            Validação médica
          </Typography>
        </Stack>
        <Typography 
          sx={{
            fontSize: '12px',
            lineHeight: '16px',
            color: theme.textDark,
            fontFamily: theme.fontFamily,
          }}
        >
          Dr. Carlos Silva (CRM 12345-SP) está revisando as recomendações.
        </Typography>
      </Stack>
    </Box>
  );
}
