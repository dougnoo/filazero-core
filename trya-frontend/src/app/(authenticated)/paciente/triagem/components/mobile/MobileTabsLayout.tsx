'use client';

import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import type { TriageSessionResponse } from '../../services/triageHistoryService';
import type { UseTriageSocketReturn } from '../../hooks/useTriageSocket';
import type { Patient, Step, SessionStatus, TriageHistory } from '../../lib/types';
import type { TriageValidationStatus } from '@/shared/services/triageStatusService';
import TriageChat from '../TriageChat';
import HistoryList from '../sidebar/HistoryList';
import HistoryListSkeleton from '../sidebar/HistoryListSkeleton';
import InfoTabContent from './InfoTabContent';
import BackButton from '@/shared/components/BackButton';

export type TabValue = 'triagem' | 'historico' | 'informacoes';

const TAB_CONFIG = {
  triagem: { label: 'Triagem', index: 0 },
  historico: { label: 'Histórico', index: 1 },
  informacoes: { label: 'Informações', index: 2 },
} as const;

export interface MobileTabsLayoutProps {
  currentSession: TriageSessionResponse | null;
  sessionId: string;
  isLoadingSession: boolean;
  socket: UseTriageSocketReturn;
  userName: string;
  onNavigateToNetwork: () => void;
  onNewTriagem: () => void;
  onSessionIdChange: (sessionId: string) => void;
  patient: Patient;
  sessionStatus: SessionStatus | null;
  steps: Step[];
  currentStep: number;
  onSelectHistory: (historyId: string) => void;
  selectedHistoryId: string | null;
  validationStatus: TriageValidationStatus | null;
  isLoadingValidation: boolean;
  triageHistory: TriageHistory[];
  loadingHistory: boolean;
  hasMoreHistory: boolean;
  loadingMoreHistory: boolean;
  onLoadMoreHistory: () => void;
  onSessionStageChange: (newStage: string) => void;
}

export default function MobileTabsLayout({
  currentSession,
  sessionId,
  isLoadingSession,
  socket,
  userName,
  onNavigateToNetwork,
  onNewTriagem,
  onSessionIdChange,
  patient,
  sessionStatus,
  steps,
  currentStep,
  onSelectHistory,
  selectedHistoryId,
  validationStatus,
  isLoadingValidation,
  triageHistory,
  loadingHistory,
  hasMoreHistory,
  loadingMoreHistory,
  onLoadMoreHistory,
  onSessionStageChange
}: MobileTabsLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('triagem');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  const handleSelectHistory = (historyId: string) => {
    onSelectHistory(historyId);
    setActiveTab('triagem');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        gap: 1
      }}
    >
      <BackButton />

      <Box>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor='primary'
          textColor='inherit'
          aria-label="Navegação de triagem mobile"
        >
          <Tab
            label={TAB_CONFIG.triagem.label}
            value="triagem"
            id="tab-triagem"
            aria-controls="tabpanel-triagem"
          />
          <Tab
            label={TAB_CONFIG.historico.label}
            value="historico"
            id="tab-historico"
            aria-controls="tabpanel-historico"
          />
          <Tab
            label={TAB_CONFIG.informacoes.label}
            value="informacoes"
            id="tab-informacoes"
            aria-controls="tabpanel-informacoes"
          />
        </Tabs>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          role="tabpanel"
          hidden={activeTab !== 'triagem'}
          id="tabpanel-triagem"
          aria-labelledby="tab-triagem"
          sx={{
            height: '100%',
            display: activeTab === 'triagem' ? 'flex' : 'none',
            flexDirection: 'column',
          }}
        >
          <TriageChat
            currentSession={currentSession}
            sessionId={sessionId}
            isLoadingSession={isLoadingSession}
            socket={socket}
            patient={patient}
            steps={steps}
            currentStep={currentStep}
            userName={userName}
            onNavigateToNetwork={onNavigateToNetwork}
            onNewTriagem={onNewTriagem}
            onSessionIdChange={onSessionIdChange}
            onSessionStageChange={onSessionStageChange}
          />
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 'historico'}
          id="tabpanel-historico"
          aria-labelledby="tab-historico"
          sx={{
            height: '100%',
            display: activeTab === 'historico' ? 'flex' : 'none',
            flexDirection: 'column',
          }}
        >
          {loadingHistory ? (
            <HistoryListSkeleton count={3} />
          ) : (
            <HistoryList
              history={triageHistory}
              selectedId={selectedHistoryId ?? undefined}
              onSelect={handleSelectHistory}
              hasMore={hasMoreHistory}
              loadingMore={loadingMoreHistory}
              onLoadMore={onLoadMoreHistory}
            />
          )}
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 'informacoes'}
          id="tabpanel-informacoes"
          aria-labelledby="tab-informacoes"
          sx={{
            height: '100%',
            display: activeTab === 'informacoes' ? 'flex' : 'none',
            flexDirection: 'column',
          }}
        >
          <InfoTabContent
            patient={patient}
            sessionStatus={sessionStatus}
            steps={steps}
            currentStep={currentStep}
            validationStatus={validationStatus}
            isLoadingValidation={isLoadingValidation}
          />
        </Box>
      </Box>
    </Box>
  );
}
