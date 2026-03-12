'use client';

import { Button } from '@mui/material';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useToast } from '@/shared/context/ToastContext';
import { telemedicineService } from '../../services/telemedicineService';

export default function ConnectDoctorButton({ 
  onConnectDoctor 
}: { 
  onConnectDoctor?: () => void;
}) {
  const theme = useThemeColors();
  const { showError } = useToast();
  
  const handleConnectDoctor = async () => {
    try {
      const magicLink = await telemedicineService.getMagicLink();
      window.open(magicLink, '_blank');
    } catch (error) {      
      showError('Erro ao conectar com médico. Tente novamente mais tarde.');
    }
    onConnectDoctor?.();
  };
  
  return (
    <Button 
      variant="contained" 
      fullWidth
      onClick={handleConnectDoctor}
      sx={{
        bgcolor: theme.primary,
        color: theme.secondary,
        fontSize: '12px',
        fontWeight: 500,
        textTransform: 'none',
        py: 1.5,
        borderRadius: '8px',
        fontFamily: theme.fontFamily,
        '&:hover': {
          bgcolor: theme.primary,
          opacity: 0.9,
        },
      }}
    >
      Conectar com médico conveniado
    </Button>
  );
}

