"use client";

import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import type {
  MedicalCertificate,
  CertificateFilters,
  CertificateStatus,
} from "./types/certificate.types";
import { certificateService } from "./services/certificate.service";
import { SearchFilters } from "@/shared/components/Table/SearchFilters";
import { StatusChip } from "@/shared/components/Table/StatusChip";
import { DataTable, TableColumn, TableAction } from "@/shared/components/Table/DataTable";
import BackButton from "@/shared/components/BackButton";

// Ícone de visualizar (olho) customizado - padrão Figma
const ViewIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.23 6.33C13.3958 6.51375 13.4876 6.75248 13.4876 7C13.4876 7.24752 13.3958 7.48625 13.23 7.67C12.18 8.8 9.79 11 7 11C4.21 11 1.82 8.8 0.769998 7.67C0.604159 7.48625 0.51236 7.24752 0.51236 7C0.51236 6.75248 0.604159 6.51375 0.769998 6.33C1.82 5.2 4.21 3 7 3C9.79 3 12.18 5.2 13.23 6.33Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 9C8.10457 9 9 8.10457 9 7C9 5.89543 8.10457 5 7 5C5.89543 5 5 5.89543 5 7C5 8.10457 5.89543 9 7 9Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "VIEWED", label: "Visualizado" },
];

const STATUS_COLOR_MAP: Record<string, { color: string; bgColor: string }> = {
  PENDING: { color: "#041616", bgColor: "#FFEDD4" },
  VIEWED: { color: "#041616", bgColor: "#BCDF84" },
};

export default function AtestadosPage() {
  const router = useRouter();
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
        <Typography fontWeight={500}>
          {value}
        </Typography>
      ),
    },
    {
      key: "beneficiaryCpf",
      label: "CPF",
      render: (value) => (
        <Typography>
          {value}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      label: "Data de envio",
      render: (value) => (
        <Typography>
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
          showArrow={false}
        />
      ),
    },
  ];

  // Table actions configuration
  const actions: TableAction<MedicalCertificate>[] = [
    {
      icon: <ViewIcon />,
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
            <BackButton variant="icon-only" />
            <Typography
              component="h3"
              fontSize={{ xs: "1.5rem", md: "2rem" }}
              fontWeight={700}
            >
              Atestados médicos
            </Typography>
            <Typography>
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
            onRetry={loadCertificates}
            emptyMessage="Nenhum atestado encontrado"
          />
        </Box>
      </Box>
    </Box>
  );
}