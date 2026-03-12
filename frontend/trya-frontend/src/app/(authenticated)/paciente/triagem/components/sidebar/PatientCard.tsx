'use client';

import { Avatar, Box, Stack, Typography } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { Patient, SessionStatus } from '../../lib/types';

const STATUS_LABELS: Record<SessionStatus | 'NEW', string> = {
  DRAFT: 'Triagem em andamento',
  PENDING: 'Triagem pendente',
  COMPLETED: 'Triagem concluída',
  NEW: 'Triagem em andamento',
};

interface PatientCardProps {
  patient: Patient;
  sessionStatus?: SessionStatus | null;
}

export function getStatusLabel(sessionStatus: SessionStatus | null | undefined): string {
  if (sessionStatus === null || sessionStatus === undefined) {
    return STATUS_LABELS.NEW;
  }
  return STATUS_LABELS[sessionStatus];
}

export default function PatientCard({ patient, sessionStatus }: PatientCardProps) {
  const initials = patient.name.split(' ').map(p=>p[0]).slice(0,2).join('');
  
  // Usa o sessionStatus para determinar o texto de status
  // Se sessionStatus não for fornecido, usa o status do patient como fallback
  const displayStatus = sessionStatus !== undefined 
    ? getStatusLabel(sessionStatus)
    : patient.status;
  
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: '8px',
         
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      <Stack spacing={2}>
        {/* Linha superior: Avatar, Nome e Afiliação */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar 
            sx={{ 
              bgcolor: 'secondary.main',
              color: 'primary.main',
              width: 48,
              height: 48,
              fontSize: '16px',
              fontWeight: 600,
              flexShrink: 0,
               
            }}
          >
            {initials}
          </Avatar>
          
          {/* Nome e afiliação à direita do avatar */}
          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
            {/* Nome - Chivo, 600, 24px, line-height 24px, letter-spacing -0.4px */}
            <Typography 
              sx={{
                 
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '24px',
                letterSpacing: '-0.4px',
              }}
            >
              {patient.name}
            </Typography>
            
            {/* Afiliação - Chivo, 400, 12px, line-height 16px */}
            {patient.affiliation && (
              <Typography 
                sx={{
                   
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: 'text.primary',
                }}
              >
                {patient.affiliation}
              </Typography>
            )}
          </Stack>
        </Stack>
        
        {/* Linha inferior: Status e horário abaixo do avatar */}
        <Stack spacing={0.5} sx={{ pl: 0 }}>
          {/* Status - Chivo, 700, 14px, line-height 20px */}
          <Typography 
            sx={{
               
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              color: 'text.primary',
            }}
          >
            {displayStatus}
          </Typography>
          
          {/* Horário de início - Chivo, 400, 14px, line-height 20px, cor #4A6060 */}
          {patient.startedAt && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTime 
                sx={{ 
                  fontSize: '14px',
                  color: 'grey.800',
                }} 
              />
              <Typography 
                sx={{
                   
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: 'grey.800',
                }}
              >
                Iniciado em {patient.startedAt}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
