'use client';

import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';
import type { HealthAlert, AlertPriority } from '../types/insights.types';

interface AlertCardProps {
  alert: HealthAlert;
}

const priorityConfig: Record<
  AlertPriority,
  { color: 'error' | 'warning' | 'info'; bgColor: string }
> = {
  HIGH: { color: 'error', bgColor: '#fdecea' },
  MEDIUM: { color: 'warning', bgColor: '#fff3cd' },
  LOW: { color: 'info', bgColor: '#e7f3ff' },
};

const getIcon = (type: string) => {
  switch (type) {
    case 'EXPIRED':
      return <ErrorIcon color="error" />;
    case 'EXPIRING_SOON':
      return <WarningAmberIcon color="warning" />;
    case 'REMINDER':
      return <NotificationsIcon color="info" />;
    default:
      return <InfoIcon color="info" />;
  }
};

export function AlertCard({ alert }: AlertCardProps) {
  const router = useRouter();
  const config = priorityConfig[alert.priority];

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: config.bgColor,
        border: `1px solid`,
        borderColor: `${config.color}.main`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {getIcon(alert.type)}
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 0.5,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {alert.title}
            </Typography>
            <Chip
              label={alert.priority}
              size="small"
              color={config.color}
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {alert.message}
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => router.push(alert.actionRoute)}
          >
            {alert.actionLabel}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
