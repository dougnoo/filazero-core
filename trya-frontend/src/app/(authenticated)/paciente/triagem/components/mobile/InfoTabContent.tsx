'use client';

import { Box } from '@mui/material';
import { TriageValidationStatus } from '@/shared/services/triageStatusService';
import PatientCard from '../sidebar/PatientCard';
import Steps from '../sidebar/Steps';
import ValidationCard from '../sidebar/ValidationCard';
import ConnectDoctorButton from '../sidebar/ConnectDoctorButton';
import { Patient, Step, SessionStatus } from '../../lib/types';
import { HealthDataCard } from '@/shared/components/HealthData';

export interface InfoTabContentProps {
  patient: Patient;
  sessionStatus: SessionStatus | null;
  steps: Step[];
  currentStep: number;
  validationStatus: TriageValidationStatus | null;
  isLoadingValidation: boolean;
}

export default function InfoTabContent({
  patient,
  sessionStatus,
  steps,
  currentStep,
  validationStatus,
  isLoadingValidation,
}: InfoTabContentProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        pb: 2,
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: '#9CA3AF',
          borderRadius: '3px',
          '&:hover': { bgcolor: '#6B7280' },
        },
      }}
    >
      <PatientCard patient={patient} sessionStatus={sessionStatus} />
      <Steps steps={steps} currentStep={currentStep} />
      <HealthDataCard showEmptyState={false} collapsible={false} />
      <ValidationCard
        validationStatus={validationStatus}
        isLoading={isLoadingValidation}
      />
      <ConnectDoctorButton />
    </Box>
  );
}
