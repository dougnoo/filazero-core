'use client';

import { Box, Paper, Typography, Grid, LinearProgress } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { DocumentStatistics } from '../types/insights.types';

interface StatisticsCardProps {
  statistics: DocumentStatistics;
}

export function StatisticsCard({ statistics }: StatisticsCardProps) {
  const {
    totalDocuments,
    validDocuments,
    expiredDocuments,
    expiringInNext30Days,
  } = statistics;

  const validPercentage =
    totalDocuments > 0 ? (validDocuments / totalDocuments) * 100 : 0;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Resumo dos Documentos
      </Typography>

      <Grid container spacing={3}>
        <Grid>
          <Box sx={{ textAlign: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {totalDocuments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total
            </Typography>
          </Box>
        </Grid>

        <Grid>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="success.main">
              {validDocuments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Válidos
            </Typography>
          </Box>
        </Grid>

        <Grid>
          <Box sx={{ textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="error.main">
              {expiredDocuments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vencidos
            </Typography>
          </Box>
        </Grid>

        <Grid>
          <Box sx={{ textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="warning.main">
              {expiringInNext30Days}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vencem em 30 dias
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Documentos válidos</Typography>
          <Typography variant="body2" fontWeight={600}>
            {validPercentage.toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={validPercentage}
          color={validPercentage >= 80 ? 'success' : validPercentage >= 50 ? 'warning' : 'error'}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>
    </Paper>
  );
}
