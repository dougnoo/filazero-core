import { Box, Typography, Button, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface MemedSyncBannerProps {
  onNavigateToProfile?: () => void;
}

export function MemedSyncBanner({ onNavigateToProfile }: MemedSyncBannerProps) {
  const router = useRouter();

  const handleNavigate = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else {
      router.push('/medico/perfil#memed-integration');
    }
  };

  return (
    <Alert
      severity="info"
      sx={{
        mb: 3,
        borderRadius: '12px',
        bgcolor: '#E3F2FD',
        border: '1px solid #BBDEFB',
        '& .MuiAlert-icon': {
          color: '#1976D2',
          fontSize: '24px',
        },
        '& .MuiAlert-message': {
          width: '100%',
          p: 0,
        },
      }}
      icon={<IntegrationInstructionsIcon />}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          py: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '16px',
              color: '#1565C0',
              mb: 0.5,
            }}
          >
            Sincronize sua conta com o Memed
          </Typography>
          <Typography
            sx={{
              fontSize: '14px',
              color: '#1976D2',
              lineHeight: 1.4,
            }}
          >
            Para aprovar prescrições médicas, você precisa sincronizar sua conta com a plataforma Memed.
          </Typography>
        </Box>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={handleNavigate}
          color='info'
          sx={{
            minWidth: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          Sincronizar agora
        </Button>
      </Box>
    </Alert>
  );
}