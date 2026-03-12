'use client';

import { Box, Paper, Typography, Chip, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import BiotechIcon from '@mui/icons-material/Biotech';
import type { MemberHealthSummary } from '../types/insights.types';

interface MemberSummaryCardProps {
  summary: MemberHealthSummary;
}

export function MemberSummaryCard({ summary }: MemberSummaryCardProps) {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {summary.memberName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {summary.totalDocuments} documento(s)
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {summary.hasRecentVaccination && (
          <Chip
            icon={<VaccinesIcon />}
            label="Vacinação em dia"
            size="small"
            color="success"
            variant="outlined"
          />
        )}
        {summary.hasRecentExam && (
          <Chip
            icon={<BiotechIcon />}
            label="Exames recentes"
            size="small"
            color="info"
            variant="outlined"
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 3, fontSize: '0.875rem' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Último documento
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {formatDate(summary.lastDocumentDate)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Próximo vencimento
          </Typography>
          <Typography
            variant="body2"
            fontWeight={500}
            color={summary.nextExpiration ? 'warning.main' : 'text.secondary'}
          >
            {formatDate(summary.nextExpiration)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
