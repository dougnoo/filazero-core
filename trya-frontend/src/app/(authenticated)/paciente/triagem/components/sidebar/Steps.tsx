'use client';

import { Box, Stack, LinearProgress, Typography } from '@mui/material';
import { Step as StepType } from '../../lib/types';

export default function Steps({ 
  steps, 
  currentStep = 0 
}: { 
  steps: StepType[];
  currentStep?: number; // 1-5, 0 means not started
}) {
  const totalSteps = steps.length;
  // currentStep is 1-based (1-5), so progress = currentStep / totalSteps * 100
  const progress = totalSteps > 0 && currentStep > 0 ? (currentStep / totalSteps) * 100 : 0;
  
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: 'background.paper',
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
         
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Título */}
      <Box sx={{ p: "12px 24px 0 24px" }}>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 600, 
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
          bgcolor: 'divider',
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
                color: 'grey.800',
              }}
            >
              Etapa {Math.max(1, currentStep)} de {totalSteps}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: 'grey.800',
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
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'primary.main',
                borderRadius: '3px',
              },
            }} 
          />
        </Stack>

        {/* Lista de etapas */}
        <Stack spacing={1.5}>
          {steps.map((step, index) => {
            const stepNumber = index + 1; // 1-based step number
            const isCurrentStep = currentStep === stepNumber;
            const isCompletedStep = currentStep > stepNumber;
            
            return (
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
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    bgcolor: isCurrentStep 
                      ? 'primary.main' 
                      : isCompletedStep 
                        ? 'primary.light' 
                        : 'action.hover',
                    color: isCurrentStep || isCompletedStep
                      ? 'primary.contrastText'
                      : 'grey.800',
                  }}
                >
                  {stepNumber}
                </Box>
                <Typography
                  sx={{
                    fontSize: '13px',
                    color: isCurrentStep 
                      ? 'primary.main'
                      : 'secondary.contrastText',
                    fontWeight: isCurrentStep ? 600 : 400,
                  }}
                >
                  {step.title}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}
