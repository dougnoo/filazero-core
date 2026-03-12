'use client';

import { Box, Stack, Typography, Skeleton } from '@mui/material';
import { CheckCircle, Schedule, HourglassEmpty } from '@mui/icons-material';
import { triageStatusService, type TriageValidationStatus } from '@/shared/services/triageStatusService';

interface ValidationCardProps {
  validationStatus: TriageValidationStatus | null;
  isLoading?: boolean;
}

export default function ValidationCard({ validationStatus, isLoading }: ValidationCardProps) {
  // Se está carregando, mostra skeleton
  if (isLoading) {
    return (
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.default',
          borderRadius: '8px',           
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Stack spacing={1.5}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="80%" height={16} />
        </Stack>
      </Box>
    );
  }

  // Se não há validação, não renderiza nada
  if (!validationStatus?.hasValidation) {
    return null;
  }

  // Determina o ícone baseado no status
  const getStatusIcon = () => {
    switch (validationStatus.status) {
      case 'APPROVED':
      case 'ADJUSTED':
        return <CheckCircle sx={{ color: 'primary.main', fontSize: '20px' }} />;
      case 'IN_REVIEW':
        return <Schedule sx={{ color: 'primary.main', fontSize: '20px' }} />;
      case 'PENDING':
      default:
        return <HourglassEmpty sx={{ color: 'primary.main', fontSize: '20px' }} />;
    }
  };

  // Determina o título baseado no status
  const getTitle = () => {
    switch (validationStatus.status) {
      case 'APPROVED':
        return 'Validação concluída';
      case 'ADJUSTED':
        return 'Validação ajustada';
      case 'IN_REVIEW':
        return 'Em análise médica';
      case 'PENDING':
      default:
        return 'Aguardando validação';
    }
  };

  // Formata a descrição baseada no status e médico
  const getDescription = () => {
    if (validationStatus.assignedDoctor) {
      const doctor = validationStatus.assignedDoctor;
      const boardInfo = triageStatusService.formatDoctorBoard(doctor);
      
      switch (validationStatus.status) {
        case 'APPROVED':
        case 'ADJUSTED':
          return `${doctor.name}${boardInfo ? ` (${boardInfo})` : ''} validou as recomendações.`;
        case 'IN_REVIEW':
          return `${doctor.name}${boardInfo ? ` (${boardInfo})` : ''} está revisando as recomendações.`;
        default:
          return triageStatusService.getStatusDescription(validationStatus.status);
      }
    }
    
    return triageStatusService.getStatusDescription(validationStatus.status);
  };
  
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.default',
        borderRadius: '8px',
         
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          {getStatusIcon()}
          <Typography 
            sx={{
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '20px',
              color: 'text.primary',
               
            }}
          >
            {getTitle()}
          </Typography>
        </Stack>
        <Typography 
          sx={{
            fontSize: '12px',
            lineHeight: '16px', 
             
          }}
        >
          {getDescription()}
        </Typography>
      </Stack>
    </Box>
  );
}
