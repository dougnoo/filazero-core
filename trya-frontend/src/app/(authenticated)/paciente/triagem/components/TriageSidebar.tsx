'use client';

import { Box } from '@mui/material';
import PatientCard from './sidebar/PatientCard';
import Steps from './sidebar/Steps';
import ValidationCard from './sidebar/ValidationCard';
import ConnectDoctorButton from './sidebar/ConnectDoctorButton';
import HistoryList from './sidebar/HistoryList';
import HistoryListSkeleton from './sidebar/HistoryListSkeleton';

import { useTriageHistory, useTriageValidation } from '../hooks';
import { Patient, Step, SessionStatus } from '../lib/types';
import BackButton from '@/shared/components/BackButton';
import { HealthDataCard } from '@/shared/components/HealthData';

export interface TriageSidebarProps {
  patient: Patient;
  sessionStatus: SessionStatus | null;
  steps: Step[];
  currentStep: number;
  onSelectHistory: (historyId: string) => void;
  selectedHistoryId: string | null;
}

export default function TriageSidebar({
  patient,
  sessionStatus,
  steps,
  currentStep,
  onSelectHistory,
  selectedHistoryId,
}: TriageSidebarProps) {
  const { validationStatus, isLoading: isLoadingValidation } = useTriageValidation();
  const { 
    history: triageHistory, 
    loading: loadingHistory, 
    hasMore, 
    loadingMore, 
    loadMore 
  } = useTriageHistory();

  return (
    <Box
      sx={{
        width: { xs: '100%', md: '360px' },
        minWidth: { xs: '100%', md: '360px' },
        maxWidth: { xs: '100%', md: '360px' },
        height: { xs: 'auto', md: '100%' },
        maxHeight: { xs: '120px', md: '100%' },
        overflowY: { xs: 'auto', md: 'auto' },
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, md: 2 },
        pr: { xs: 0, md: 1 },
        pb: { xs: 0, md: 2 },
        flexShrink: 0,
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { 
          bgcolor: '#9CA3AF', 
          borderRadius: '3px', 
          '&:hover': { bgcolor: '#6B7280' } 
        },
      }}
    >
      <BackButton />

      <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2 }}>
        <PatientCard patient={patient} sessionStatus={sessionStatus} />
        <Steps steps={steps} currentStep={currentStep} />
        <HealthDataCard showEmptyState={false} collapsible={false} />
        <ValidationCard validationStatus={validationStatus} isLoading={isLoadingValidation} />
        <ConnectDoctorButton />
      </Box>

      {loadingHistory ? (
        <HistoryListSkeleton count={3} />
      ) : (
        <HistoryList
          history={triageHistory}
          selectedId={selectedHistoryId ?? undefined}
          onSelect={onSelectHistory}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      )}

      <Box sx={{ display: { md: 'none' } }}>
        <ConnectDoctorButton />
      </Box>
    </Box>
  );
}
