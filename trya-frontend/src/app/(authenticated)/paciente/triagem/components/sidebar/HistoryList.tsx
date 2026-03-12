'use client';

import { Box, Stack, Typography, Chip, Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ChevronRight } from '@mui/icons-material';
import { TriageHistory } from '../../lib/types';

interface HistoryListProps {
  history?: TriageHistory[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export default function HistoryList({ 
  history = [],
  selectedId,
  onSelect,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: HistoryListProps) {
  const theme = useTheme();
  const items = history;

  const getStatusLabel = (item: TriageHistory) => {
    if (item.isActive) return 'Em andamento';
    if (item.status === 'COMPLETED') return 'Finalizada';
    return 'Pendente';
  };

  const getStatusColor = (item: TriageHistory) => {
    if (item.isActive) return theme.palette.primary.main;
    if (item.status === 'COMPLETED') return '#4caf50';
    return '#ff9800';
  };

  return (
    <Stack spacing={0} sx={{ mt: { xs: 0, md: 2 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: { xs: 'pointer', md: 'default' },
          bgcolor: { xs: 'background.paper', md: 'transparent' },
          borderRadius: { xs: '12px', md: 0 },
          p: { xs: 1.5, md: 0 },
          mb: { xs: 0, md: 2 },
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Histórico de triagem
        </Typography>
      </Box>
      

        <Box
          sx={{
            mt: { xs: 1, md: 0 },
            bgcolor: { xs: 'background.default', md: 'transparent' },
            borderRadius: { xs: '12px', md: 0 },
            p: { xs: 1.5, md: 0 },
            maxHeight: { xs: '70dvh', md: 'none' },
            overflowY: { xs: 'auto', md: 'visible' },
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: '#9CA3AF',
              borderRadius: '2px',
            },
          }}
        >
          <Stack spacing={1}>
            {items.length === 0 ? (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: 'grey.800',
                }}
              >
                Sem histórico
              </Typography>
            ) : (
              <>
                {items.map((item) => {
                  const isSelected = item.id === selectedId;
                  return (
                    <Box
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect?.(item.id);
                      }}
                      sx={{
                        bgcolor: isSelected ? 'action.hover' : 'background.default',
                        borderRadius: '8px',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.03)',
                        border: isSelected ? `1px solid ${theme.palette.primary.main}` : '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        backgroundColor: isSelected ? 'secondary.light': 'background.paper',
                        '&:hover': {
                          border: `1px solid ${theme.palette.primary.main}`,
                          opacity: 0.9,
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <Stack spacing={0.5} sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: 400,
                            }}
                          >
                            {item.title}
                          </Typography>
                          {item.status && (
                            <Chip
                              label={getStatusLabel(item)}
                              size="small"
                              sx={{
                                height: '18px',
                                fontSize: '10px',
                                bgcolor: getStatusColor(item),
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '11px',
                            color: 'grey.800',
                          }}
                        >
                          {item.date}
                        </Typography>
                      </Stack>
                      <ChevronRight 
                        sx={{ 
                          color: 'grey.800',
                          fontSize: '20px',
                        }} 
                      />
                    </Box>
                  );
                })}

                {/* Load More Button */}
                {hasMore && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadMore?.();
                    }}
                    disabled={loadingMore}
                    variant="text"
                    size="small"
                    sx={{
                      mt: 1,
                      color: 'primary.main',
                      fontSize: '12px',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {loadingMore ? (
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                    ) : null}
                    {loadingMore ? 'Carregando...' : 'Carregar mais'}
                  </Button>
                )}
              </>
            )}
          </Stack>
        </Box>
      </Stack>
  );
}
