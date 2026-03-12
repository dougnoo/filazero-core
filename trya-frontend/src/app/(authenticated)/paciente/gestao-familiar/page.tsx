'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { insightsService } from './services/insightsService';
import { documentService } from '@/app/(authenticated)/paciente/gestao-familiar/documentos/services/documentService';
import { StatisticsCard } from './components/StatisticsCard';
import { AlertCard } from './components/AlertCard';
import { MemberSummaryCard } from './components/MemberSummaryCard';
import { ExpiringDocumentsList } from './components/ExpiringDocumentsList';
import type { HealthInsights } from './types/insights.types';
import type { FamilyMember } from '@/app/(authenticated)/paciente/gestao-familiar/documentos/types/document.types';
import { FamilyManagementLayout } from '../components/FamilyManagementLayout';

export default function GestaoFamiliarPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [insights, setInsights] = useState<HealthInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await documentService.getMembers();
        setMembers(response.members);
        if (response.members[0]) {
          setSelectedMemberId(response.members[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar membros', err);
      }
    };

    loadMembers();
  }, []);

  if(true) {
    return (
      <FamilyManagementLayout
        activeTab="dashboard"
        members={members}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
      >
        Dashboard
      </FamilyManagementLayout>
    );
  }

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await insightsService.getHealthInsights();
      setInsights(data);
    } catch (err) {
      setError('Erro ao carregar informações de saúde');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  if (loading) {
    return (
      <Box sx={{ px: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadInsights}>
              Tentar novamente
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!insights) {
    return null;
  }

  const filteredAlerts = insights.alerts.filter(
    (alert) => !alert.memberUserId || alert.memberUserId === selectedMemberId,
  );
  const filteredExpiringDocuments = insights.expiringDocuments.filter(
    (doc) => doc.memberUserId === selectedMemberId,
  );
  const filteredSummaries = insights.memberSummaries.filter(
    (summary) => summary.memberId === selectedMemberId,
  );

  return (
    <FamilyManagementLayout
      activeTab="dashboard"
      members={members}
      selectedMemberId={selectedMemberId}
      onSelectMember={setSelectedMemberId}
    >
      <Box sx={{ py: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Documentos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visão geral dos documentos do membro selecionado
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadInsights}
          >
            Atualizar
          </Button>
        </Box>

        {filteredAlerts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Alertas
            </Typography>
            {filteredAlerts.map((alert, index) => (
              <AlertCard key={index} alert={alert} />
            ))}
          </Box>
        )}

        <StatisticsCard statistics={insights.statistics} />

        <ExpiringDocumentsList documents={filteredExpiringDocuments} />

        {filteredSummaries.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Resumo por Membro
            </Typography>
            <Grid container spacing={2}>
              {filteredSummaries.map((summary) => (
                <Grid item xs={12} sm={6} md={4} key={summary.memberId}>
                  <MemberSummaryCard summary={summary} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </FamilyManagementLayout>
  );
}
