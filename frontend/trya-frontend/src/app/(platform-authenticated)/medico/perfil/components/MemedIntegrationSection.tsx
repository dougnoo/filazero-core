import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { MemedSyncModal } from '@/app/(platform-authenticated)/medico/components/MemedSyncModal';
import { memedService } from '@/shared/services/memedService';
import { BoardCode } from '@/shared/types/medical';
import { useToast } from '@/shared/hooks/useToast';
import { GetTokenResponse, SyncMemedResponse } from '../../types/memed';

interface MemedIntegrationSectionProps {
  doctorId: string;
  currentBoardCode?: string;
  currentBoardNumber?: string;
  currentBoardState?: string;
  onSyncSuccess?: () => void;
}

export function MemedIntegrationSection({
  doctorId,
  currentBoardCode,
  currentBoardNumber,
  currentBoardState,
  onSyncSuccess,
}: MemedIntegrationSectionProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    isSynced: boolean;
    tokenData?: GetTokenResponse;
    error?: string;
  }>({ isSynced: false });

  const checkSyncStatus = async () => {
    setIsLoading(true);
    try {
      const tokenData = await memedService.getDoctorToken(doctorId);
      setSyncStatus({
        isSynced: true,
        tokenData,
      });
    } catch (error) {
      console.error('Error checking sync status:', error);
      setSyncStatus({
        isSynced: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar status',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, [doctorId]);

  const handleSyncSuccess = (response: SyncMemedResponse) => {
    showSuccess('Conta sincronizada com sucesso com o Memed!');
    checkSyncStatus(); // Refresh status
    onSyncSuccess?.();
  };

  const handleSyncClick = () => {
    setSyncModalOpen(true);
  };

  const getStatusChip = () => {
    if (isLoading) {
      return (
        <Chip
          icon={<CircularProgress size={16} />}
          label="Verificando..."
          size="small"
          sx={{
            bgcolor: '#F5F5F5',
            color: 'grey.800',
          }}
        />
      );
    }

    if (syncStatus.isSynced) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Sincronizado"
          size="small"
          sx={{
            bgcolor: '#E8F5E8',
            color: '#2E7D32',
            '& .MuiChip-icon': {
              color: '#2E7D32',
            },
          }}
        />
      );
    }

    return (
      <Chip
        icon={<ErrorIcon />}
        label="Não sincronizado"
        size="small"
        sx={{
          bgcolor: '#FFEBEE',
          color: '#C62828',
          '& .MuiChip-icon': {
            color: '#C62828',
          },
        }}
      />
    );
  };

  return (
    <Box id="memed-integration">
      {/* Divider */}
      <Box sx={{ borderBottom: `1px solid #E5E7EB`, my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 700, 
            mb: 3,
          }}
        >
          Integração Memed
        </Typography>

        <Box
          sx={{
            bgcolor: '#F8F9FA',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            p: 3,
          }}
        >
          {/* Header with icon and status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IntegrationInstructionsIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  Plataforma Memed
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'grey.800',
                  }}
                >
                  Prescrições médicas digitais
                </Typography>
              </Box>
            </Box>
            {getStatusChip()}
          </Box>

          {/* Description */}
          <Typography
            sx={{
              fontSize: '14px',
              color: 'grey.800',
              mb: 3,
              lineHeight: 1.5,
            }}
          >
            Sincronize sua conta com a plataforma Memed para prescrever medicamentos e exames 
            digitalmente durante o processo de aprovação médica.
          </Typography>

          {/* Sync status details */}
          {syncStatus.isSynced && syncStatus.tokenData && (
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                p: 2,
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'grey.800',
                  mb: 1,
                }}
              >
                Informações da sincronização
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '14px'}}>
                  <strong>Conselho:</strong> {syncStatus.tokenData.boardCode} {syncStatus.tokenData.boardNumber}/{syncStatus.tokenData.boardState}
                </Typography>
                <Typography sx={{ fontSize: '14px'}}>
                  <strong>Status:</strong> {syncStatus.tokenData.memedStatus}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Error message */}
          {syncStatus.error && !isLoading && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
              {syncStatus.error}
            </Alert>
          )}

          {/* Action button */}
          <Button
            variant={syncStatus.isSynced ? 'outlined' : 'contained'}
            color="primary"
            onClick={handleSyncClick}
            disabled={isLoading}
            
          >
            {syncStatus.isSynced ? 'Ressincronizar' : 'Sincronizar com Memed'}
          </Button>
        </Box>
      </Box>

      {/* Sync Modal */}
      <MemedSyncModal
        open={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        doctorId={doctorId}
        initialData={{
          boardCode: currentBoardCode as BoardCode,
          boardNumber: currentBoardNumber,
          boardState: currentBoardState,
        }}
        onSyncSuccess={handleSyncSuccess}
      />
    </Box>
  );
}