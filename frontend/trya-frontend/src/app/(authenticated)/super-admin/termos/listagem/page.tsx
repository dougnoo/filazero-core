'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Typography, Tabs, Tab, Alert } from '@mui/material';
import BackButton from '@/shared/components/BackButton';
import {
  ConfirmationDialog,
  type ConfirmationDialogAction,
} from '@/shared/components/ConfirmationDialog';
import { TermsListingFilters } from './components/TermsListingFilters';
import { TermsListingTable } from './components/TermsListingTable';
import { TermDetailsModal } from './components/TermDetailsModal';
import {
  termsListingService,
  TermType,
  TermStatus,
  TermListItem,
} from './services/termsListingService';

export default function TermsListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === '1' ? 1 : 0;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [terms, setTerms] = useState<TermListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  const [searchValue, setSearchValue] = useState('');
  const [statusValue, setStatusValue] = useState<TermStatus | ''>('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [detailsModal, setDetailsModal] = useState<{
    open: boolean;
    term: TermListItem | null;
  }>({ open: false, term: null });

  const [reprocessModal, setReprocessModal] = useState<{
    open: boolean;
    term: TermListItem | null;
    loading: boolean;
  }>({ open: false, term: null, loading: false });

  const currentType = activeTab === 0 ? TermType.TERMS_OF_USE : TermType.PRIVACY_POLICY;

  const loadTerms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await termsListingService.getTermsList({
        type: currentType,
        search: searchValue || undefined,
        status: statusValue || undefined,
        page: currentPage,
        pageSize: itemsPerPage,
      });

      setTerms(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar termos';
      setError(errorMessage);
      setTerms([]);
    } finally {
      setLoading(false);
    }
  }, [currentType, searchValue, statusValue, currentPage, itemsPerPage]);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    setSearchValue('');
    setStatusValue('');
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadTerms();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleReprocessClick = (term: TermListItem) => {
    setReprocessModal({ open: true, term, loading: false });
  };

  const handleReprocessConfirm = async () => {
    if (!reprocessModal.term) return;

    setReprocessModal((prev) => ({ ...prev, loading: true }));

    try {
      await termsListingService.reprocessTerm(reprocessModal.term.id);
      setSuccess('Termo enviado para reprocessamento');
      setReprocessModal({ open: false, term: null, loading: false });
      loadTerms();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao reprocessar termo';
      setError(errorMessage);
      setReprocessModal({ open: false, term: null, loading: false });
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleReprocessCancel = () => {
    if (reprocessModal.loading) return;
    setReprocessModal({ open: false, term: null, loading: false });
  };

  const handleView = (term: TermListItem) => {
    setDetailsModal({ open: true, term });
  };

  const handleImport = () => {
    const typeParam = activeTab === 0 ? 'terms' : 'privacy';
    router.push(`/super-admin/termos/importar?type=${typeParam}`);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModal({ open: false, term: null });
  };

  const importButtonLabel =
    activeTab === 0 ? 'Importar termo de uso' : 'Importar política de privacidade';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <BackButton variant="icon-only" onClick={() => router.push('/admin')} />

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '24px', md: '28px' },
          mb: 3,
        }}
      >
        Listagem
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              px: 0,
              mr: 4,
              minWidth: 'auto',
            },
            '& .Mui-selected': {
              color: 'text.primary',
            },
            '& .MuiTabs-indicator': {
              height: 2,
            },
          }}
        >
          <Tab label="Termos de uso" />
          <Tab label="Políticas de privacidade" />
        </Tabs>
      </Box>

      <TermsListingFilters
        searchValue={searchValue}
        statusValue={statusValue}
        onSearchChange={setSearchValue}
        onStatusChange={setStatusValue}
        onSearch={handleSearch}
        onImport={handleImport}
        importButtonLabel={importButtonLabel}
      />

      <TermsListingTable
        data={terms}
        loading={loading}
        error={null}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onReprocess={handleReprocessClick}
        onView={handleView}
        onRetry={loadTerms}
      />

      <TermDetailsModal
        open={detailsModal.open}
        onClose={handleCloseDetailsModal}
        term={detailsModal.term}
      />

      <ConfirmationDialog
        open={reprocessModal.open}
        onClose={handleReprocessCancel}
        title="Reprocessar termo"
        message={`Deseja reprocessar o termo versão ${reprocessModal.term?.version || ''}?`}
        isLoading={reprocessModal.loading}
        actions={[
          {
            label: 'Cancelar',
            onClick: handleReprocessCancel,
            variant: 'outlined',
            disabled: reprocessModal.loading,
          },
          {
            label: 'Reprocessar',
            onClick: handleReprocessConfirm,
            variant: 'contained',
            color: 'primary',
            disabled: reprocessModal.loading,
          },
        ]}
      />
    </Container>
  );
}
