'use client';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { TermListItem, TermStatus } from '../services/termsListingService';
import { ViewIcon, RefreshIcon } from '@/shared/components/icons';
import {
  StatusChip,
  TablePagination,
  tableContainerStyles,
  tableCellStyles,
  tableHeaderRowStyles,
  emptyTableCellStyles,
} from '@/shared/components/Table';

interface TermsListingTableProps {
  data: TermListItem[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onReprocess: (term: TermListItem) => void;
  onView: (term: TermListItem) => void;
  onRetry?: () => void;
}

const statusColorMap: Record<string, { color: string; bgColor: string }> = {
  [TermStatus.COMPLETO]: { color: '#041616', bgColor: '#BCDF84' },
  [TermStatus.FALHA]: { color: '#041616', bgColor: '#FECACA' },
  [TermStatus.PENDENTE]: { color: '#041616', bgColor: '#E5E7EB' },
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

export function TermsListingTable({
  data,
  loading,
  error,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onReprocess,
  onView,
  onRetry,
}: TermsListingTableProps) {
  const columns = [
    { key: 'version', label: 'Versão' },
    { key: 'effectiveDate', label: 'Data de vigência' },
    { key: 'uploadedBy', label: 'Upload por' },
    { key: 'uploadDate', label: 'Data de upload' },
    { key: 'status', label: 'Status' },
  ];

  const totalColumns = columns.length + 1;

  return (
    <TableContainer component={Paper} sx={tableContainerStyles}>
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Table sx={tableCellStyles}>
            <TableHead>
              <TableRow sx={tableHeaderRowStyles}>
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.label}</TableCell>
                ))}
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={totalColumns} align="center" sx={emptyTableCellStyles}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography color="error" variant="h6" gutterBottom>
                        Erro ao carregar dados
                      </Typography>
                      <Typography color="grey.800" sx={{ mb: 2 }}>
                        {error}
                      </Typography>
                      {onRetry && (
                        <Typography
                          component="button"
                          onClick={onRetry}
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            border: 'none',
                            background: 'none',
                            fontSize: '1rem',
                          }}
                        >
                          Tentar novamente
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={totalColumns} align="center" sx={emptyTableCellStyles}>
                    <Typography color="grey.800">
                      Nenhum item encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((term) => (
                  <TableRow key={term.id}>
                    <TableCell>v{term.version}</TableCell>
                    <TableCell>{formatDate(term.effectiveDate)}</TableCell>
                    <TableCell>{term.uploadedBy}</TableCell>
                    <TableCell>{formatDate(term.uploadDate)}</TableCell>
                    <TableCell>
                      <StatusChip
                        status={term.status}
                        label={statusLabelMap[term.status] || term.status}
                        colorMap={statusColorMap}
                        showArrow={false}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Reprocessar">
                        <IconButton
                          size="small"
                          onClick={() => onReprocess(term)}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => onView(term)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          )}
        </>
      )}
    </TableContainer>
  );
}
