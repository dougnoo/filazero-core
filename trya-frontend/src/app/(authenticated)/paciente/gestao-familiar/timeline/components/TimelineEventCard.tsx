'use client';

import { Box, Paper, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'next/navigation';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import BiotechIcon from '@mui/icons-material/Biotech';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import DescriptionIcon from '@mui/icons-material/Description';
import MedicationIcon from '@mui/icons-material/Medication';
import EventIcon from '@mui/icons-material/Event';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { TimelineEvent, TimelineEventType } from '../types/timeline.types';

interface TimelineEventCardProps {
  event: TimelineEvent;
}

const eventTypeConfig: Record<
  TimelineEventType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  DOCUMENT_UPLOADED: {
    icon: <DescriptionIcon />,
    color: '#1976d2',
    label: 'Documento',
  },
  DOCUMENT_DELETED: {
    icon: <DescriptionIcon />,
    color: '#9e9e9e',
    label: 'Documento Removido',
  },
  VACCINATION: {
    icon: <VaccinesIcon />,
    color: '#4caf50',
    label: 'Vacinação',
  },
  LAB_EXAM: {
    icon: <BiotechIcon />,
    color: '#ff9800',
    label: 'Exame Laboratorial',
  },
  IMAGING_EXAM: {
    icon: <MedicalServicesIcon />,
    color: '#9c27b0',
    label: 'Exame de Imagem',
  },
  MEDICAL_REPORT: {
    icon: <DescriptionIcon />,
    color: '#2196f3',
    label: 'Laudo Médico',
  },
  PRESCRIPTION: {
    icon: <MedicationIcon />,
    color: '#f44336',
    label: 'Receita',
  },
  MEDICAL_APPOINTMENT: {
    icon: <EventIcon />,
    color: '#00bcd4',
    label: 'Consulta',
  },
};

export function TimelineEventCard({ event }: TimelineEventCardProps) {
  const router = useRouter();
  const config = eventTypeConfig[event.eventType] || eventTypeConfig.DOCUMENT_UPLOADED;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleViewDocument = () => {
    if (event.entityType === 'medical_documents' && event.entityId) {
      router.push(`/paciente/documentos/${event.entityId}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: config.color,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {config.icon}
      </Box>

      <Paper sx={{ flex: 1, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {event.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={config.label}
                size="small"
                sx={{ backgroundColor: config.color + '20', color: config.color }}
              />
              <Typography variant="body2" color="text.secondary">
                {event.memberName}
              </Typography>
            </Box>
            {event.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {event.description}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatDate(event.eventDate)}
            </Typography>
            {event.entityType === 'medical_documents' && event.entityId && (
              <Tooltip title="Ver documento">
                <IconButton size="small" onClick={handleViewDocument}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
