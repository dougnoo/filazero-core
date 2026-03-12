'use client';

import { Box, Stack, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { TriageHistory } from '../../lib/types';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export default function HistoryList({ 
  history = [],
  onSelect
}: { 
  history?: TriageHistory[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const theme = useThemeColors();
  const defaultHistory: TriageHistory[] = history.length > 0 ? history : [
    { id: '1', title: 'Febre e dor de cabeça', date: 'Hoje' },
    { id: '2', title: 'Dor no braço', date: '10/10/2025' },
  ];

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontSize: '14px',
          fontWeight: 600,
          color: theme.textDark,
          fontFamily: theme.fontFamily,
        }}
      >
        Histórico de triagem
      </Typography>
      
      <Stack spacing={1.5}>
        {defaultHistory.map((item) => {
          return (
            <Box
              key={item.id}
              onClick={() => onSelect?.(item.id)}
              sx={{
                bgcolor: theme.chipBackground,
                borderRadius: '8px',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
                '&:hover': {
                  bgcolor: theme.chipBackground,
                  opacity: 0.9,
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '13px',
                    color: theme.textDark,
                    fontWeight: 400,
                    fontFamily: theme.fontFamily,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: theme.textMuted,
                    fontFamily: theme.fontFamily,
                  }}
                >
                  {item.date}
                </Typography>
              </Stack>
              <ChevronRight 
                sx={{ 
                  color: theme.textMuted,
                  fontSize: '20px',
                }} 
              />
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}
