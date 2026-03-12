'use client';

import { Box, Stack, LinearProgress, Typography } from '@mui/material';
import { Step as StepType } from '../../lib/types';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export default function Steps({ 
  steps, 
  currentStep = 0 
}: { 
  steps: StepType[];
  currentStep?: number;
}) {
  const theme = useThemeColors();
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  
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
      {/* Título */}
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
          Etapas
        </Typography>
      </Box>

      {/* Linha divisória */}
      <Box
        sx={{
          width: "100%",
          height: "1px",
          backgroundColor: theme.softBorder,
        }}
      />

      {/* Conteúdo */}
      <Box sx={{ p: "24px 24px 24px 24px" }}>
        {/* Barra de progresso no início */}
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography
              sx={{
                fontSize: "12px",
                color: theme.textMuted,
                fontFamily: theme.fontFamily,
              }}
            >
              Etapa {currentStep + 1} de {totalSteps}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: theme.textMuted,
                fontFamily: theme.fontFamily,
              }}
            >
              {Math.round(progress)}%
            </Typography>
          </Stack>
          <LinearProgress 
            value={progress} 
            variant="determinate" 
            sx={{ 
              width: "100%",
              height: 6,
              borderRadius: '3px',
              bgcolor: theme.backgroundSoft,
              '& .MuiLinearProgress-bar': {
                bgcolor: theme.primary,
                borderRadius: '3px',
              },
            }} 
          />
        </Stack>

        {/* Lista de etapas */}
        <Stack spacing={1.5}>
          {steps.slice(0, 4).map((step, index) => (
            <Box
              key={step.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              {/* Contador quadrado */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '4px', // Quadrado com bordas arredondadas
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: theme.fontFamily,
                  bgcolor: index === currentStep 
                    ? theme.primary 
                    : index < currentStep 
                      ? theme.success 
                      : theme.backgroundSoft,
                  color: index === currentStep || index < currentStep
                    ? '#FFFFFF'
                    : theme.textMuted,
                }}
              >
                {index + 1}
              </Box>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontFamily: theme.fontFamily,
                  color: index === currentStep 
                    ? theme.primary 
                    : theme.textDark,
                  fontWeight: index === currentStep ? 600 : 400,
                }}
              >
                {step.title}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
