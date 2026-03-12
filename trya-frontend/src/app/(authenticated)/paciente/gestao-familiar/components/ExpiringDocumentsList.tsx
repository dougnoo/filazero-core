'use client';

import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/navigation';
import type { ExpiringDocument } from '../types/insights.types';

interface ExpiringDocumentsListProps {
  documents: ExpiringDocument[];
}

export function ExpiringDocumentsList({ documents }: ExpiringDocumentsListProps) {
  const router = useRouter();

  if (documents.length === 0) {
    return null;
  }

  const getChipColor = (days: number): 'error' | 'warning' | 'info' => {
    if (days <= 7) return 'error';
    if (days <= 14) return 'warning';
    return 'info';
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Documentos Prestes a Vencer
      </Typography>

      <List disablePadding>
        {documents.map((doc, index) => (
          <ListItem
            key={doc.id}
            divider={index < documents.length - 1}
            sx={{ px: 0 }}
          >
            <ListItemIcon>
              <DescriptionIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary={doc.title}
              secondary={
                <Box component="span" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography component="span" variant="body2" color="text.secondary">
                    {doc.memberName}
                  </Typography>
                  <Typography component="span" variant="body2" color="text.secondary">
                    •
                  </Typography>
                  <Typography component="span" variant="body2" color="text.secondary">
                    Vence em {new Date(doc.validUntil).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`${doc.daysUntilExpiration} dia(s)`}
                  size="small"
                  color={getChipColor(doc.daysUntilExpiration)}
                />
                <Tooltip title="Ver documento">
                  <IconButton
                    size="small"
                    onClick={() => router.push(`/paciente/documentos/${doc.id}`)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
