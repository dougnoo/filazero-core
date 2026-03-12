"use client";

import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type {
  MedicalCertificate,
  CertificateFilters,
  CertificateStatus,
} from "./types/certificate.types";
import { certificateService } from "./services/certificate.service";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { SearchFilters } from "@/shared/components/Table/SearchFilters";
import { StatusChip } from "@/shared/components/Table/StatusChip";
import { DataTable, TableColumn, TableAction } from "@/shared/components/Table/DataTable";

const STATUS_OPTIONS = [
  { value: "APPROVED", label: "Aprovado" },
  { value: "PENDING", label: "Pendente" },
  { value: "REJECTED", label: "Rejeitado" },
];

const STATUS_COLOR_MAP = {
  APPROVED: { color: "#10B981", bgColor: "#D1FAE5" },
  PENDING: { color: "#F59E0B", bgColor: "#FEF3C7" },
  REJECTED: { color: "#EF4444", bgColor: "#FEE2E2" },
};

export default function AtestadosPage() {
  const router = useRouter();
  const theme = useThemeColors();
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CertificateFilters>({});

  // Search state
  const [nameSearch, setNameSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadCertificates();
  }, [currentPage, itemsPerPage, filters]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificateService.listHR(currentPage, itemsPerPage, filters);
      
      setCertificates(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Erro ao carregar atestados:", error);
      setCertificates([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilters: CertificateFilters = {
      name: nameSearch || undefined,
      date: dateSearch || undefined,
      status: (statusFilter as CertificateStatus) || undefined,
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

  const handleCertificateClick = (certificate: MedicalCertificate) => {
    router.push(`/admin-rh/atestados/${certificate.id}`);
  };

  const getStatusLabel = (status: CertificateStatus) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.label || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Table column configuration
  const columns: TableColumn<MedicalCertificate>[] = [
    {
      key: "beneficiaryName",
      label: "Nome",
      render: (value) => (
        <Typography sx={{ fontWeight: 500, color: theme.textDark }}>
          {value}
        </Typography>
      ),
    },
    {
      key: "beneficiaryCpf",
      label: "CPF",
      render: (value) => (
        <Typography sx={{ color: theme.textMuted }}>
          {value}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      label: "Data de envio",
      render: (value) => (
        <Typography sx={{ color: theme.textMuted }}>
          {formatDate(value)}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <StatusChip
          status={value}
          label={getStatusLabel(value)}
          colorMap={STATUS_COLOR_MAP}
        />
      ),
    },
  ];

  // Table actions configuration
  const actions: TableAction<MedicalCertificate>[] = [
    {
      icon: <VisibilityIcon />,
      onClick: (certificate) => handleCertificateClick(certificate),
      tooltip: "Visualizar atestado",
    },
  ];

  return (
    <Box component="main" sx={{ pb: { xs: 6, md: 8 } }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, md: 2 },
          py: { xs: 4, md: 4 },
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
          <Box>
            <Typography
              component="h1"
              sx={{
                fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "24px", md: "28px" },
                color: theme.textDark,
                mb: 1,
              }}
            >
              Atestados médicos
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                color: theme.textMuted,
              }}
            >
              Visualize a listagem dos atestados médicos enviados pelos funcionários da sua organização
            </Typography>
          </Box>

          {/* Search and Filters */}
          <SearchFilters
            searchValue={nameSearch}
            dateValue={dateSearch}
            statusValue={statusFilter}
            statusOptions={STATUS_OPTIONS}
            onSearchChange={setNameSearch}
            onDateChange={setDateSearch}
            onStatusChange={setStatusFilter}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por nome"
            datePlaceholder="Filtrar por data"
            statusPlaceholder="Filtrar por status"
          />

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={certificates}
            actions={actions}
            onRowClick={handleCertificateClick}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            loading={loading}
            error={null}
            onRetry={loadCertificates}
            emptyMessage="Nenhum atestado encontrado"
          />
        </Box>
      </Box>
    </Box>
  );
}