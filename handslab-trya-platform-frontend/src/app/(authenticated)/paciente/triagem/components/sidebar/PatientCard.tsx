'use client';

import { Avatar, Box, Stack, Typography } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { Patient } from '../../lib/types';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export default function PatientCard({ patient }: { patient: Patient }) {
  const theme = useThemeColors();
  const initials = patient.name.split(' ').map(p=>p[0]).slice(0,2).join('');
  
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#FFFFFF',
        borderRadius: '8px',
        fontFamily: theme.fontFamily,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      <Stack spacing={2}>
        {/* Linha superior: Avatar, Nome e Afiliação */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar 
            sx={{ 
              bgcolor: theme.avatarBackground,
              color: theme.primary,
              width: 48,
              height: 48,
              fontSize: '16px',
              fontWeight: 600,
              flexShrink: 0,
              fontFamily: theme.fontFamily,
            }}
          >
            {initials}
          </Avatar>
          
          {/* Nome e afiliação à direita do avatar */}
          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
            {/* Nome - Chivo, 600, 24px, line-height 24px, letter-spacing -0.4px */}
            <Typography 
              sx={{
                fontFamily: theme.fontFamily,
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '24px',
                letterSpacing: '-0.4px',
                color: theme.textDark,
              }}
            >
              {patient.name}
            </Typography>
            
            {/* Afiliação - Chivo, 400, 12px, line-height 16px */}
            {patient.affiliation && (
              <Typography 
                sx={{
                  fontFamily: theme.fontFamily,
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: theme.textDark,
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
              fontFamily: theme.fontFamily,
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              color: theme.textDark,
            }}
          >
            {patient.status}
          </Typography>
          
          {/* Horário de início - Chivo, 400, 14px, line-height 20px, cor #4A6060 */}
          {patient.startedAt && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTime 
                sx={{ 
                  fontSize: '14px',
                  color: '#4A6060',
                }} 
              />
              <Typography 
                sx={{
                  fontFamily: theme.fontFamily,
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#4A6060',
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
