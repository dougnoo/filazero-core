'use client';

import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { TermListItem, TermStatus } from '../services/termsListingService';

interface TermDetailsModalProps {
  open: boolean;
  onClose: () => void;
  term: TermListItem | null;
}

const statusColorMap: Record<TermStatus, { color: string; bgColor: string }> = {
  [TermStatus.COMPLETO]: { color: '#166534', bgColor: '#DCFCE7' },
  [TermStatus.FALHA]: { color: '#92400E', bgColor: '#FEF3C7' },
  [TermStatus.PENDENTE]: { color: '#6B7280', bgColor: '#F3F4F6' },
};

const statusLabelMap: Record<TermStatus, string> = {
  [TermStatus.COMPLETO]: 'Completo',
  [TermStatus.FALHA]: 'Falha',
  [TermStatus.PENDENTE]: 'Pendente',
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

const getFileName = (term: TermListItem) => {
  const typePrefix = term.type === 'TERMS_OF_USE' ? 'termo_de_uso' : 'politica_privacidade';
  return `${typePrefix}_v${term.version}`;
};

export function TermDetailsModal({ open, onClose, term }: TermDetailsModalProps) {
  if (!term) return null;

  const handleVisualize = () => {
    if (term.s3Url) {
      window.open(term.s3Url, '_blank');
    }
  };

  const handleDownload = () => {
    if (term.s3Url) {
      const link = document.createElement('a');
      link.href = term.s3Url;
      link.download = `${getFileName(term)}.pdf`;
      link.click();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            maxWidth: '500px',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ position: 'relative', p: 3 }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '18px',
              mb: 3,
            }}
          >
            Detalhes da importação
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 3,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: 'text.secondary',
                  mb: 0.5,
                }}
              >
                Versão
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                v{term.version}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: 'text.secondary',
                  mb: 0.5,
                }}
              >
                Data de vigência
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {formatDate(term.effectiveDate)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 3,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: 'text.secondary',
                  mb: 0.5,
                }}
              >
                Upload por
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {term.uploadedBy}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: 'text.secondary',
                  mb: 0.5,
                }}
              >
                Data de upload
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {formatDate(term.uploadDate)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: '12px',
                color: 'text.secondary',
                mb: 1,
              }}
            >
              Status
            </Typography>
            <Chip
              label={statusLabelMap[term.status] || term.status}
              size="small"
              sx={{
                bgcolor: statusColorMap[term.status]?.bgColor || '#F3F4F6',
                color: statusColorMap[term.status]?.color || '#6B7280',
                fontWeight: 500,
                fontSize: '12px',
                height: 28,
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '16px',
                mb: 1,
              }}
            >
              Anexos
            </Typography>

            <Typography
              sx={{
                fontSize: '12px',
                color: 'text.secondary',
                mb: 1.5,
              }}
            >
              Arquivo importado
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                bgcolor: '#F9FAFB',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DescriptionOutlinedIcon sx={{ color: 'grey.500', fontSize: 24 }} />
                <Box>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {getFileName(term)}{' '}
                    <Typography
                      component="span"
                      onClick={handleVisualize}
                      sx={{
                        color: 'text.secondary',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      • Visualizar
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: 'text.secondary',
                  }}
                >
                  1.3MB
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleDownload}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '6px',
                    borderColor: '#D1D5DB',
                    color: 'text.primary',
                    px: 2,
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      bgcolor: '#F9FAFB',
                    },
                  }}
                >
                  Baixar
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
