"use client";

import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { EvaluationsBanner } from "./components/EvaluationsBanner";
import { MemedSyncBanner } from "./components/MemedSyncBanner";
import { useMedicalApprovalRequests } from "./hooks/useMedicalApprovalRequests";
import type {
  MedicalApprovalRequestItem,
  ListMedicalApprovalRequestsParams,
  MedicalApprovalRequestStatus,
  UrgencyLevel,
} from "./types";
import { usePlatformAuth } from "@/shared/hooks/usePlatformAuth";
import { medicalApprovalRequestsService } from "@/shared/services/medicalApprovalRequestsService";
import { memedService } from "@/shared/services/memedService";
import { ConfirmationDialog } from "@/shared/components";
import { useToast } from "@/shared/hooks/useToast";
import { SearchFilters } from "@/shared/components/Table/SearchFilters";
import { StatusChip } from "@/shared/components/Table/StatusChip";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/shared/components/Table/DataTable";

import {
  STATUS_OPTIONS,
  STATUS_COLOR_MAP,
  URGENCY_COLOR_MAP,
  URGENCY_DISPLAY_MAP,
  STATUS_DISPLAY_MAP,
  URGENCY_OPTIONS,
} from "./constants";

const DiagnosticIcon: React.FC<{ stroke?: string }> = ({ stroke = '#FFFFFF' }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M26.7443 15.544V21.0881C26.7443 21.6296 26.3054 22.0685 25.764 22.0685H2.23642C1.695 22.0685 1.2561 21.6296 1.2561 21.0881V5.40311C1.2561 4.8617 1.695 4.42279 2.23642 4.42279H6.68458"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.0395 22.0688L10.0789 26.9704"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.9607 22.0688L17.9213 26.9704"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.11816 26.9702H19.8819"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.8638 1.17133H17.9615C18.2527 1.17133 18.5319 1.28699 18.7378 1.49286C18.9436 1.69873 19.0593 1.97796 19.0593 2.2691V5.27972C19.0593 6.44431 18.5966 7.56119 17.7732 8.38469C16.9496 9.20818 15.8328 9.67081 14.6682 9.67081C13.5037 9.67081 12.3867 9.20818 11.5632 8.38469C10.7397 7.56119 10.2771 6.44431 10.2771 5.27972V2.2691C10.2771 1.97796 10.3928 1.69873 10.5986 1.49286C10.8045 1.28699 11.0837 1.17133 11.3749 1.17133H12.4727"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24.5486 7.47544C25.7611 7.47544 26.7441 6.49246 26.7441 5.2799C26.7441 4.06734 25.7611 3.08435 24.5486 3.08435C23.3359 3.08435 22.353 4.06734 22.353 5.2799C22.353 6.49246 23.3359 7.47544 24.5486 7.47544Z"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.6682 9.6707V10.2196C14.6682 11.5297 15.1887 12.7862 16.115 13.7127C17.0414 14.6391 18.2979 15.1596 19.6081 15.1596C20.9183 15.1596 22.1748 14.6391 23.1012 13.7127C24.0277 12.7862 24.5481 11.5297 24.5481 10.2196V7.47516"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function MedicoPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = usePlatformAuth();
  const { showSuccess, showError } = useToast();
  const {
    medicalApprovalRequests,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    isLoading,
    error,
    setCurrentPage,
    setItemsPerPage,
    setFilters,
    refetch,
  } = useMedicalApprovalRequests();

  // Memed sync status
  const [showMemedBanner, setShowMemedBanner] = useState(false);
  const [checkingMemedStatus, setCheckingMemedStatus] = useState(true);

  // Search state
  const [patientNameSearch, setPatientNameSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");

  // Assignment modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMedicalApprovalRequest, setSelectedMedicalApprovalRequest] =
    useState<MedicalApprovalRequestItem | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Check Memed sync status on component mount
  useEffect(() => {
    const checkMemedSyncStatus = async () => {
      if (!user?.id) {
        setCheckingMemedStatus(false);
        return;
      }

      try {
        const isSynced = await memedService.checkSyncStatus(user.id);
        setShowMemedBanner(!isSynced);
      } catch (error) {
        console.error('Error checking Memed sync status:', error);
        // Show banner on error to be safe
        setShowMemedBanner(true);
      } finally {
        setCheckingMemedStatus(false);
      }
    };

    checkMemedSyncStatus();
  }, [user?.id]);

  const handleSearch = () => {
    const newFilters: ListMedicalApprovalRequestsParams = {
      patientName: patientNameSearch || undefined,
      date: dateSearch || undefined,
      status: (statusFilter as MedicalApprovalRequestStatus) || undefined,
      urgencyLevel: (urgencyFilter as UrgencyLevel) || undefined,
    };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleMedicalApprovalRequestClick = (
    medicalApprovalRequest: MedicalApprovalRequestItem
  ) => {
    router.push(`/medico/avaliacoes/${medicalApprovalRequest.id}`);
  };

  const handleAssignmentSuccess = () => {
    refetch();
  };

  const handleRowClick = (
    medicalApprovalRequest: MedicalApprovalRequestItem
  ) => {
    // If already assigned (not PENDING), go directly to details
    if (medicalApprovalRequest.status !== "PENDING") {
      handleMedicalApprovalRequestClick(medicalApprovalRequest);
      return;
    }

    // If PENDING, show assignment modal
    setSelectedMedicalApprovalRequest(medicalApprovalRequest);
    setAssignModalOpen(true);
    setAssignError(null);
  };

  const handleCloseModal = () => {
    if (!isAssigning) {
      setAssignModalOpen(false);
      setSelectedMedicalApprovalRequest(null);
      setAssignError(null);
    }
  };

  const handleViewOnly = () => {
    if (selectedMedicalApprovalRequest) {
      handleCloseModal();
      handleMedicalApprovalRequestClick(selectedMedicalApprovalRequest);
    }
  };

  const handleAssignAndView = async () => {
    if (!selectedMedicalApprovalRequest) return;

    setIsAssigning(true);
    setAssignError(null);

    try {
      await medicalApprovalRequestsService.assign(
        selectedMedicalApprovalRequest.id
      );

      showSuccess("Solicitação atribuída com sucesso!");

      handleCloseModal();

      // Refresh the list
      handleAssignmentSuccess();

      // Navigate to details
      handleMedicalApprovalRequestClick(selectedMedicalApprovalRequest);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao atribuir solicitação. Tente novamente.";

      setAssignError(errorMessage);
      showError(errorMessage);
      setIsAssigning(false);
    }
  };

  // Table column configuration
  const columns: TableColumn<MedicalApprovalRequestItem>[] = [
    {
      key: "patientName",
      label: "Nome do paciente",
      render: (value) => (
        <Typography sx={{ fontWeight: 500, }}>
          {value}
        </Typography>
      ),
    },
    {
      key: "chiefComplaint",
      label: "Descrição",
      render: (value) => (
        <Typography
          sx={{
            color: 'grey.800',
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      key: "date",
      label: "Data",
      render: (value) => (
        <Typography sx={{ color: 'grey.800' }}>{value}</Typography>
      ),
    },
    {
      key: "createdAt",
      label: "Hora",
      render: (value: string) => (
        <Typography sx={{ color: 'grey.800' }}>
          {new Date(value).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      ),
    },
    {
      key: "urgencyLevel",
      label: "Criticidade",
      render: (value: UrgencyLevel | undefined) => {
        if (!value || !URGENCY_COLOR_MAP[value]) {
          return (
            <Typography sx={{ color: 'grey.800' }}>
              Não definido
            </Typography>
          );
        }

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor: URGENCY_COLOR_MAP[value].color,
              }}
            />
            {URGENCY_DISPLAY_MAP[value]}
          </Box>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: MedicalApprovalRequestStatus) => (
        <StatusChip
          status={value}
          label={STATUS_DISPLAY_MAP[value]}
          colorMap={STATUS_COLOR_MAP}
        />
      ),
    },
  ];

  // Table actions configuration
  const actions: TableAction<MedicalApprovalRequestItem>[] = [
    {
      icon: <ArrowForwardIcon />,
      onClick: (medicalApprovalRequest) =>
        handleRowClick(medicalApprovalRequest),
      tooltip: "Ver detalhes",
    },
  ];

  return (
    <Box component="main" sx={{ pb: { xs: 6, md: 8 } }}>
      <EvaluationsBanner />

      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, md: 2 },
          py: { xs: 4, md: 0 },
        }}
      >
        <Box
          component="section"
          sx={{
            maxWidth: 1200,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Page Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              aria-hidden
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: "50%",
                bgcolor: 'primary.main',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: { xs: "0 0 48px", sm: "0 0 56px" },
              }}
            >
              <DiagnosticIcon stroke={theme.palette.primary.contrastText} />
            </Box>
            <Box>
              <Typography
                component="h2"
                sx={{
                   
                  fontWeight: 700,
                  fontSize: { xs: "24px", md: "28px" },
                  color: 'text.primary',
                }}
              >
                Avaliações
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: 'grey.800',
                  mt: 0.5,
                }}
              >
                Revise as sugestões da IA
              </Typography>
            </Box>
          </Box>

          {/* Memed Sync Banner */}
          {showMemedBanner && !checkingMemedStatus && <MemedSyncBanner />}

          {/* Search and Filters */}
          <SearchFilters
            searchValue={patientNameSearch}
            dateValue={dateSearch}
            statusValue={statusFilter}
            statusOptions={STATUS_OPTIONS}
            urgencyValue={urgencyFilter}
            urgencyOptions={URGENCY_OPTIONS}
            onSearchChange={setPatientNameSearch}
            onDateChange={setDateSearch}
            onStatusChange={setStatusFilter}
            onUrgencyChange={setUrgencyFilter}
            onSearch={handleSearch}
            searchPlaceholder="Busca por nome"
            datePlaceholder="Buscar por data"
            statusPlaceholder="Filtrar por status"
            urgencyPlaceholder="Filtrar por criticidade"
          />

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={medicalApprovalRequests}
            actions={actions}
            onRowClick={handleRowClick}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            loading={isLoading}
            error={error}
            onRetry={refetch}
            emptyMessage="Nenhuma solicitação de aprovação médica encontrada"
            headerBackgroundColor="#BEE1EB80"
          />

          {/* Assignment Confirmation Modal */}
          <ConfirmationDialog
            open={assignModalOpen}
            onClose={handleCloseModal}
            title="Atribuir Solicitação"
            message="Deseja atribuir esta solicitação a você ou apenas visualizar os detalhes?"
            isLoading={isAssigning}
            error={assignError}
            actions={[
              {
                label: "Apenas visualizar",
                onClick: handleViewOnly,
                variant: "text",
              },
              {
                label: isAssigning ? "Atribuindo..." : "Atribuir e visualizar",
                onClick: handleAssignAndView,
                variant: "contained",
              },
            ]}
          >
            {selectedMedicalApprovalRequest && (
              <Box
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: "8px",
                  p: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  {selectedMedicalApprovalRequest.patientName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: 'grey.800',
                    mb: 1,
                  }}
                >
                  {selectedMedicalApprovalRequest.chiefComplaint}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: 'grey.800',
                  }}
                >
                  Data: {selectedMedicalApprovalRequest.date} às{" "}
                  {new Date(
                    selectedMedicalApprovalRequest.createdAt
                  ).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
            )}
          </ConfirmationDialog>
        </Box>
      </Box>
    </Box>
  );
}
