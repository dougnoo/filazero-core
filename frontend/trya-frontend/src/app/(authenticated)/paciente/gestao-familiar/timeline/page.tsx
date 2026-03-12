'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { timelineService } from './services/timelineService';
import { TimelineEventCard } from './components/TimelineEventCard';
import { documentService } from '../documentos/services/documentService';
import type {
  PaginatedTimeline,
  TimelineEventType,
} from './types/timeline.types';
import type { FamilyMember } from '../documentos/types/document.types';
import { FamilyManagementLayout } from '@/app/(authenticated)/paciente/components/FamilyManagementLayout';
import { useRouter } from 'next/navigation';
import { useTenantAssets } from '@/shared/context/TenantThemeProvider';
import { getUrlWithTenant } from '@/shared/utils/tenantUtils';

export default function TimelinePage() {
  const router = useRouter();
  const { tenant } = useTenantAssets();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [eventType, setEventType] = useState<TimelineEventType | ''>('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const [timeline, setTimeline] = useState<PaginatedTimeline | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await documentService.getMembers();
        setMembers(data.members);
        if (data.members.length > 0) {
          setSelectedMember(data.members[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar membros', err);
      }
    };
    loadMembers();
  }, []);

  const loadTimeline = useCallback(async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      setError(null);
      const data = await timelineService.list({
        memberUserId: selectedMember,
        eventType: eventType || undefined,
        dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
        dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
        page,
        limit: 10,
      });
      setTimeline(data);
    } catch (err) {
      setError('Erro ao carregar timeline');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedMember, eventType, dateFrom, dateTo, page]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <FamilyManagementLayout
        activeTab="timeline"
        members={members}
        selectedMemberId={selectedMember}
        onSelectMember={(id) => {
          setSelectedMember(id);
          setPage(1);
        }}
      >
        <Box sx={{ py: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
              Linha do tempo de saúde
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por documento</InputLabel>
                <Select
                  value={eventType}
                  label="Filtrar por documento"
                  onChange={(e) => {
                    setEventType(e.target.value as TimelineEventType | '');
                    setPage(1);
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="VACCINATION">Vacinação</MenuItem>
                  <MenuItem value="LAB_EXAM">Exame laboratorial</MenuItem>
                  <MenuItem value="IMAGING_EXAM">Exame de imagem</MenuItem>
                  <MenuItem value="MEDICAL_REPORT">Laudo médico</MenuItem>
                  <MenuItem value="PRESCRIPTION">Receita</MenuItem>
                  <MenuItem value="DOCUMENT_UPLOADED">Documento</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={() => router.push(getUrlWithTenant('/paciente/documentos', tenant))}
                sx={{ textTransform: 'none', fontSize: 12, fontWeight: 700 }}
              >
                + Adicionar documento
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <DatePicker
              label="De"
              value={dateFrom}
              onChange={(date) => {
                setDateFrom(date);
                setPage(1);
              }}
              slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
            />
            <DatePicker
              label="Até"
              value={dateTo}
              onChange={(date) => {
                setDateTo(date);
                setPage(1);
              }}
              slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : timeline && timeline.data.length > 0 ? (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                {timeline.data.map((event) => (
                  <TimelineEventCard key={event.id} event={event} />
                ))}
              </Box>
              {timeline.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={timeline.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Nenhum evento encontrado na timeline.
              </Typography>
            </Paper>
          )}
        </Box>
      </FamilyManagementLayout>
    </LocalizationProvider>
  );
}
