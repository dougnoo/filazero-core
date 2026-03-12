'use client';

import { Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useGlobalThemeContext } from '@/shared/context/GlobalThemeContext';
import { getUrlWithTenant } from '@/shared/utils/tenantUtils';

export default function BackButton() {
  const router = useRouter();
  const theme = useThemeColors();
  const { currentTheme } = useGlobalThemeContext();

  const handleBack = () => {
    const urlWithTenant = getUrlWithTenant('/paciente', currentTheme);
    router.push(urlWithTenant);
  };

  return (
    <Box
      sx={{
        mb: 2,
        px: { xs: 0, md: 0 },
      }}
    >
      <Box
        sx={{
          bgcolor: theme.white,
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
          height: 40,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Button
          startIcon={<ArrowBack sx={{ fontSize: '18px' }} />}
          onClick={handleBack}
          sx={{
            color: theme.textDark,
            fontSize: '14px',
            fontWeight: 400,
            textTransform: 'none',
            px: 2,
            minWidth: 'auto',
            width: '100%',
            justifyContent: 'flex-start',
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'transparent',
              opacity: 0.8,
            },
          }}
        >
          Voltar
        </Button>
      </Box>
    </Box>
  );
}


