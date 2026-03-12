"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  Snackbar,
} from "@mui/material";
import { beneficiaryService } from "./services/beneficiaryService";
import type { Beneficiary, BeneficiariesFilters, CreateBeneficiaryRequest } from "./types/beneficiary";
import { useTheme } from "@/shared/hooks/useTheme";
import { BeneficiaryModal } from "./form-components";
import { tenantService } from "./services/tenantService";
import { healthOperatorService } from "./services/healthOperatorService";

// Ícone de busca customizado
const SearchButtonIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_5120_271)">
      <path
        d="M10.1486 19.44C15.2801 19.44 19.44 15.2801 19.44 10.1486C19.44 5.01706 15.2801 0.857147 10.1486 0.857147C5.01709 0.857147 0.857178 5.01706 0.857178 10.1486C0.857178 15.2801 5.01709 19.44 10.1486 19.44Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.1429 23.1429L16.7144 16.7143"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_5120_271">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// Ícone de adicionar customizado
const AddButtonIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_5161_8)">
      <path
        d="M12 0.925713V23.2114"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.857178 12H23.1429"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_5161_8">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// Ícone de editar customizado
const EditIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_4680_10288_edit)">
      <path
        d="M0.642944 17.3571H14.7858"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.35714 12.8571L4.5 13.5514L5.14286 9.64286L13.7957 1.01572C13.9152 0.895211 14.0574 0.799561 14.2141 0.734287C14.3708 0.669013 14.5388 0.635406 14.7086 0.635406C14.8783 0.635406 15.0464 0.669013 15.203 0.734287C15.3597 0.799561 15.5019 0.895211 15.6214 1.01572L16.9843 2.37858C17.1048 2.4981 17.2004 2.6403 17.2657 2.79698C17.331 2.95365 17.3646 3.1217 17.3646 3.29143C17.3646 3.46116 17.331 3.62921 17.2657 3.78589C17.2004 3.94256 17.1048 4.08477 16.9843 4.20429L8.35714 12.8571Z"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_4680_10288_edit">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// Ícone de visualizar (olho) - mesmo do login
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

// Ícone de refresh customizado
const RefreshButtonIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.7142 12.8571L18.5714 12.1429L19.2857 15"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5713 12.1429C17.9368 13.9409 16.7842 15.5108 15.2589 16.6548C13.7335 17.7989 11.9037 18.4657 9.99989 18.5714C8.24005 18.5717 6.52277 18.0304 5.0813 17.0208C3.63982 16.0113 2.54403 14.5825 1.94275 12.9286"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.28566 7.14286L1.42852 7.85714L0.714233 5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.42847 7.85715C2.62847 4.57143 6.31418 1.42857 9.9999 1.42857C11.7683 1.43354 13.4919 1.98537 14.9344 3.0084C16.3768 4.03143 17.4676 5.47558 18.057 7.14286"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Ícone de voltar
const BackIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.2858 10H0.714355"
      stroke="#4A6060"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.71436 5L0.714355 10L5.71436 15"
      stroke="#4A6060"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function BeneficiariosPage() {
  const { theme, isLoading: themeLoading } = useTheme();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BeneficiariesFilters>({
    search: "",
    active: undefined,
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  // Estados temporários para os filtros (antes de aplicar)
  const [tempSearchInput, setTempSearchInput] = useState("");
  const [tempStatusFilter, setTempStatusFilter] = useState<string>("all");

  // Estado do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

  // Estados para empresas e operadoras de saúde
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [healthOperators, setHealthOperators] = useState<Array<{ id: string; name: string }>>([]);

  // Estado para toast de sucesso
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Estado para toast de erro
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Estado para forçar refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // Carrega empresas e operadoras de saúde ao montar o componente
  useEffect(() => {
    const loadTenantCompaniesAndOperators = async () => {
      try {
        // Busca lista de empresas (tenants) ativas
        const tenants = await tenantService.listActive();
        const tenantOptions = tenants.map(tenant => ({
          id: tenant.id,
          name: tenant.name
        }));
        setCompanies(tenantOptions);

        // Busca lista de operadoras de saúde
        const operators = await healthOperatorService.list();
        const operatorOptions = operators.map(operator => ({
          id: operator.id,
          name: operator.name
        }));
        setHealthOperators(operatorOptions);
      } catch (error) {
      }
    };

    loadTenantCompaniesAndOperators();
  }, []);

  // Carrega beneficiários quando filtros mudam
  useEffect(() => {
    const loadBeneficiaries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await beneficiaryService.list(filters);

        // Valida se a resposta tem a estrutura esperada
        if (!response || typeof response !== "object") {
          throw new Error("Resposta da API inválida");
        }

        // Adapta para diferentes formatos de resposta da API
        let beneficiariesData: Beneficiary[] = [];
        let totalCount = 0;

        // Se a resposta tem a estrutura esperada (data, total, etc)
        if ("data" in response && Array.isArray(response.data)) {
          beneficiariesData = response.data;
          totalCount = response.total || 0;
        }
        // Se a resposta é um array direto
        else if (Array.isArray(response)) {
          beneficiariesData = response as unknown as Beneficiary[];
          totalCount = beneficiariesData.length;
        }
        // Se a resposta é um único objeto (beneficiário)
        else if ("id" in response && "name" in response) {
          beneficiariesData = [response as unknown as Beneficiary];
          totalCount = 1;
        }

        setBeneficiaries(beneficiariesData);
        setTotal(totalCount);
        setTotalPages(
          "totalPages" in response && response.totalPages
            ? response.totalPages
            : Math.ceil(totalCount / (filters.limit || 10)),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar beneficiários",
        );
        setBeneficiaries([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadBeneficiaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.active, filters.search, refreshKey]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempSearchInput(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setTempStatusFilter(event.target.value);
  };

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: tempSearchInput,
      active:
        tempStatusFilter === "all" ? undefined : tempStatusFilter === "active",
      page: 1,
    }));
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setFilters((prev) => ({ ...prev, page: value }));
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setFilters((prev) => ({
      ...prev,
      limit: Number(event.target.value),
      page: 1,
    }));
  };

  const handleRefresh = () => {
    // Força uma atualização incrementando o refreshKey
    setRefreshKey((prev) => prev + 1);
    // Também reaplica os filtros para garantir que o useEffect seja disparado
    setFilters((prev) => ({ ...prev, page: prev.page }));
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedBeneficiary(null);
    setIsModalOpen(true);
  };

  // Função para abrir modal de edição - será usada nos botões de editar da tabela
  const handleOpenEditModal = (beneficiary: Beneficiary) => {
    setModalMode("edit");
    setSelectedBeneficiary(beneficiary);
    setIsModalOpen(true);
  };
  
  // Exporta handleOpenEditModal para uso futuro
  void handleOpenEditModal;

  const handleCloseModal = (clearMessages = false) => {
    setIsModalOpen(false);
    setSelectedBeneficiary(null);
    setModalMode("add");
    // Só limpa mensagens se explicitamente solicitado (ex: ao fechar manualmente)
    if (clearMessages) {
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  };

  const handleSaveBeneficiary = async (data: Partial<Beneficiary>) => {
    try {
      if (modalMode === "add") {
        // Valida campos obrigatórios
        if (!data.name || !data.cpf || !data.email || !data.dateOfBirth || !data.planId || !data.tenantId) {
          throw new Error("Campos obrigatórios não preenchidos");
        }
        
        // Remove formatação do CPF (deixa apenas números)
        const cleanCpf = data.cpf.replace(/\D/g, "");
        
        // Formata o telefone para o formato internacional esperado pela API (+55XXXXXXXXXXX)
        let phoneNumber: string | undefined;
        if (data.phone) {
          // Remove formatação (apenas números)
          const cleanPhone = data.phone.replace(/\D/g, "");
          // Se tiver 10 ou 11 dígitos (telefone brasileiro), adiciona código do país
          if (cleanPhone.length === 10 || cleanPhone.length === 11) {
            phoneNumber = `+55${cleanPhone}`;
          } else if (cleanPhone.startsWith("55") && (cleanPhone.length === 12 || cleanPhone.length === 13)) {
            // Se já começar com 55, apenas adiciona o +
            phoneNumber = `+${cleanPhone}`;
          } else if (cleanPhone.startsWith("+55")) {
            // Se já estiver no formato correto
            phoneNumber = cleanPhone;
          } else {
            // Para outros formatos, tenta adicionar +55
            phoneNumber = `+55${cleanPhone}`;
          }
        }
        
        // Garante que birthDate está no formato YYYY-MM-DD
        let birthDate = data.dateOfBirth;
        if (birthDate) {
          // Se estiver em formato diferente, converte
          const date = new Date(birthDate);
          if (!isNaN(date.getTime())) {
            birthDate = date.toISOString().split('T')[0];
          }
        }
        
        // Converte para o tipo esperado pela API
        const createData: CreateBeneficiaryRequest = {
          email: data.email.trim(),
          name: data.name.trim(),
          tenantId: data.tenantId,
          planId: data.planId,
          cpf: cleanCpf,
          birthDate: birthDate,
          phoneNumber: phoneNumber,
          // temporaryPassword é opcional e não está sendo enviado por enquanto
        };
        
        await beneficiaryService.create(createData);
        // Mostra toast de sucesso
        setSuccessMessage("Beneficiário cadastrado com sucesso!");
        // Recarrega a lista de beneficiários
        handleRefresh();
        // Fecha o modal sem limpar mensagens após um pequeno delay
        // para garantir que o toast apareça
        setTimeout(() => {
          handleCloseModal(false);
        }, 100);
      } else if (selectedBeneficiary) {
        // Para edição, converte os campos presentes
        // Garante que birthDate está no formato YYYY-MM-DD
        let birthDate = data.dateOfBirth;
        if (birthDate) {
          const date = new Date(birthDate);
          if (!isNaN(date.getTime())) {
            birthDate = date.toISOString().split('T')[0];
          }
        }
        
        // Formata o telefone para o formato internacional esperado pela API (+55XXXXXXXXXXX)
        let phone: string | undefined;
        if (data.phone) {
          // Remove formatação (apenas números)
          const cleanPhone = data.phone.replace(/\D/g, "");
          // Se tiver 10 ou 11 dígitos (telefone brasileiro), adiciona código do país
          if (cleanPhone.length === 10 || cleanPhone.length === 11) {
            phone = `+55${cleanPhone}`;
          } else if (cleanPhone.startsWith("55") && (cleanPhone.length === 12 || cleanPhone.length === 13)) {
            // Se já começar com 55, apenas adiciona o +
            phone = `+${cleanPhone}`;
          } else if (cleanPhone.startsWith("+55")) {
            // Se já estiver no formato correto
            phone = cleanPhone;
          } else {
            // Para outros formatos, tenta adicionar +55
            phone = `+55${cleanPhone}`;
          }
        }
        
        const updateData = {
          name: data.name,
          email: data.email,
          phone: phone,
          birthDate: birthDate,
        };
        
        await beneficiaryService.update(selectedBeneficiary.id, updateData);
        // Mostra toast de sucesso
        setSuccessMessage("Beneficiário atualizado com sucesso!");
        // Recarrega a lista de beneficiários
        handleRefresh();
        // Fecha o modal sem limpar mensagens após um pequeno delay
        // para garantir que o toast apareça
        setTimeout(() => {
          handleCloseModal(false);
        }, 100);
      }
    } catch (error: unknown) {
      // Extrai a mensagem de erro do backend
      // O serviço de API já extrai a mensagem do campo "message" do backend
      // e lança um Error com essa mensagem
      let message = "Ocorreu um erro ao salvar o beneficiário.";
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }
      setErrorMessage(message);
      // Não fecha o modal quando há erro, para que o usuário possa ver a mensagem
      // Re-lança o erro para que o BeneficiaryModal possa resetar o loading
      throw error;
    }
  };

  const getStatusColor = (active: boolean) => {
    return active ? "success" : "default";
  };

  const getStatusLabel = (active: boolean) => {
    return active ? "Ativo" : "Inativo";
  };

  // Aguarda o tema carregar
  if (themeLoading || !theme) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 128px)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, md: 2 },
          py: { xs: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            width: "100%",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() => router.push("/admin-rh")}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  border: "1px solid #D4DEDE",
                  color: "#4A6060",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  },
                  alignSelf: "flex-start",
                }}
              >
                <BackIcon />
              </IconButton>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: { xs: "24px", md: "28px" },
                    color: theme?.colors.text.primary || "#041616",
                  }}
                >
                  Beneficiários
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                    fontSize: { xs: "14px", md: "16px" },
                    color: "#6B7280",
                  }}
                >
                  Listagem e edição de beneficiários
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                width: { xs: "100%", md: "auto" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddButtonIcon />}
                onClick={handleOpenAddModal}
                sx={{
                  height: 40,
                  borderRadius: "8px",
                  textTransform: "none",
                  bgcolor: theme.colors.button.primary,
                  color: theme.colors.button.text,
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 600,
                  px: 3,
                  minWidth: { xs: "auto", md: "140px" },
                  flex: { xs: 1, md: 0 },
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: theme.colors.button.primaryHover,
                  },
                }}
              >
                Adicionar
              </Button>
              <Button
                variant="contained"
                onClick={handleRefresh}
                sx={{
                  height: 40,
                  width: 40,
                  minWidth: 40,
                  borderRadius: "8px",
                  p: 0,
                  flexShrink: 0,
                  bgcolor: "#F15923",
                  color: "#FFFFFF",
                  "&:hover": {
                    bgcolor: "#D14A1E",
                  },
                }}
              >
                <RefreshButtonIcon />
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              placeholder="Buscar por nome, CPF ou e-mail"
              value={tempSearchInput}
              onChange={handleSearchChange}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleApplyFilters();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchButtonIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                bgcolor: "white",
                borderRadius: "8px",
                overflow: "hidden",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "white",
                  overflow: "hidden",
                  "& fieldset": {
                    borderRadius: "8px",
                  },
                  "& input": {
                    borderRadius: "8px",
                  },
                },
              }}
            />

            <FormControl
              sx={{ 
                minWidth: { xs: "100%", sm: 200 }, 
                bgcolor: "white",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "white",
                  "& fieldset": {
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <Select
                value={tempStatusFilter}
                onChange={handleStatusChange}
                displayEmpty
                sx={{ 
                  borderRadius: "8px",
                  bgcolor: "white",
                }}
              >
                <MenuItem value="all">Todos os status</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{
                height: 56,
                width: 56,
                minWidth: 56,
                borderRadius: "8px",
                bgcolor: theme.colors.button.primary,
                color: theme.colors.button.text,
                p: 0,
                "&:hover": {
                  bgcolor: theme.colors.button.primaryHover,
                },
              }}
            >
              <SearchButtonIcon />
            </Button>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Table */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: "12px",
              boxShadow: "0px 8px 24px rgba(6,36,36,0.06)",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 8,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Table
                  sx={{
                    "& .MuiTableCell-root": {
                      borderRight: "1px solid #E5E7EB",
                      borderBottom: "1px solid #E5E7EB",
                      "&:last-child": {
                        borderRight: "none",
                      },
                    },
                    "& .MuiTableHead-root .MuiTableCell-root": {
                      borderRight: "none",
                      borderBottom: "1px solid #E5E7EB",
                    },
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8F9FA" }}>
                      <TableCell
                        sx={{
                          fontFamily:
                            "var(--font-chivo), Inter, system-ui, sans-serif",
                          fontWeight: 700,
                          fontSize: "14px",
                          color: theme?.colors.text.primary || "#041616",
                        }}
                      >
                        Nome
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily:
                            "var(--font-chivo), Inter, system-ui, sans-serif",
                          fontWeight: 700,
                          fontSize: "14px",
                          color: theme?.colors.text.primary || "#041616",
                        }}
                      >
                        CPF
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily:
                            "var(--font-chivo), Inter, system-ui, sans-serif",
                          fontWeight: 700,
                          fontSize: "14px",
                          color: theme?.colors.text.primary || "#041616",
                        }}
                      >
                        E-mail
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily:
                            "var(--font-chivo), Inter, system-ui, sans-serif",
                          fontWeight: 700,
                          fontSize: "14px",
                          color: theme?.colors.text.primary || "#041616",
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontFamily:
                            "var(--font-chivo), Inter, system-ui, sans-serif",
                          fontWeight: 700,
                          fontSize: "14px",
                          color: theme?.colors.text.primary || "#041616",
                        }}
                      >
                        Ações
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {beneficiaries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <Typography
                            sx={{
                              fontFamily:
                                "var(--font-chivo), Inter, system-ui, sans-serif",
                              color: "#6B7280",
                            }}
                          >
                            Nenhum beneficiário encontrado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      beneficiaries.map((beneficiary) => (
                        <TableRow
                          key={beneficiary.id}
                          sx={{
                            "&:hover": { bgcolor: "#F8F9FA" },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontFamily:
                                "var(--font-chivo), Inter, system-ui, sans-serif",
                              fontSize: "14px",
                            }}
                          >
                            {beneficiary.name}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily:
                                "var(--font-chivo), Inter, system-ui, sans-serif",
                              fontSize: "14px",
                            }}
                          >
                            {beneficiary.cpf}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily:
                                "var(--font-chivo), Inter, system-ui, sans-serif",
                              fontSize: "14px",
                            }}
                          >
                            {beneficiary.email}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(beneficiary.active)}
                              color={getStatusColor(beneficiary.active)}
                              size="small"
                              sx={{
                                ...(beneficiary.active && {
                                  bgcolor: "#BCDF84",
                                  color: theme?.colors.text.primary || "#041616",
                                  "& .MuiChip-label": {
                                    color: theme?.colors.text.primary || "#041616",
                                  },
                                }),
                                fontFamily:
                                  "var(--font-chivo), Inter, system-ui, sans-serif",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/admin-rh/beneficiarios/${beneficiary.id}`)}
                              sx={{
                                mr: 1,
                                color: theme.colors.secondary,
                                "&:hover": {
                                  bgcolor: "rgba(241, 89, 35, 0.08)",
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/admin-rh/beneficiarios/${beneficiary.id}`)}
                              sx={{
                                color: theme.colors.secondary,
                                "&:hover": {
                                  bgcolor: "rgba(241, 89, 35, 0.08)",
                                },
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "space-between" },
                    alignItems: "center",
                    px: 3,
                    py: 2,
                    borderTop: "1px solid #E5E7EB",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                    position: "relative",
                  }}
                >
                  {/* Setas de navegação */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      order: { xs: 2, md: 0 },
                      position: { xs: "relative", md: "absolute" },
                      left: { xs: "auto", md: "50%" },
                      transform: { xs: "none", md: "translateX(-50%)" },
                    }}
                  >
                    <IconButton
                      onClick={(e) =>
                        handlePageChange(e as React.ChangeEvent<unknown>, Math.max(1, filters.page! - 1))
                      }
                      disabled={filters.page === 1}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: filters.page === 1 ? "#E5E7EB" : theme.colors.button.primary,
                        color: filters.page === 1 ? "#9CA3AF" : "#FFFFFF",
                        "&:hover": {
                          bgcolor: filters.page === 1 ? "#E5E7EB" : theme.colors.button.primaryHover,
                        },
                        "&.Mui-disabled": {
                          bgcolor: "#E5E7EB",
                          color: "#9CA3AF",
                        },
                      }}
                    >
                      <svg
                        width="8"
                        height="12"
                        viewBox="0 0 8 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.5 1L1.5 6L6.5 11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </IconButton>
                    <IconButton
                      onClick={(e) =>
                        handlePageChange(
                          e as React.ChangeEvent<unknown>,
                          Math.min(totalPages, filters.page! + 1)
                        )
                      }
                      disabled={filters.page === totalPages}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor:
                          filters.page === totalPages
                            ? "#E5E7EB"
                            : theme.colors.button.primary,
                        color: filters.page === totalPages ? "#9CA3AF" : "#FFFFFF",
                        "&:hover": {
                          bgcolor:
                            filters.page === totalPages
                              ? "#E5E7EB"
                              : theme.colors.button.primaryHover,
                        },
                        "&.Mui-disabled": {
                          bgcolor: "#E5E7EB",
                          color: "#9CA3AF",
                        },
                      }}
                    >
                      <svg
                        width="8"
                        height="12"
                        viewBox="0 0 8 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.5 1L6.5 6L1.5 11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </IconButton>
                  </Box>

                  {/* Itens por página e contador */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      order: { xs: 1, md: 0 },
                      marginLeft: { xs: 0, md: "auto" },
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily:
                          "var(--font-chivo), Inter, system-ui, sans-serif",
                        fontSize: "14px",
                        color: "#6B7280",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Itens por página:
                    </Typography>
                    <Select
                      value={filters.limit}
                      onChange={handlePageSizeChange}
                      size="small"
                      sx={{ minWidth: 70 }}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={20}>20</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </Select>

                    <Typography
                      sx={{
                        fontFamily:
                          "var(--font-chivo), Inter, system-ui, sans-serif",
                        fontSize: "14px",
                        color: "#6B7280",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {`${(filters.page! - 1) * filters.limit! + 1}-${Math.min(
                        filters.page! * filters.limit!,
                        total,
                      )} de ${total}`}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </TableContainer>
        </Box>
      </Box>

      {/* Modal de adicionar/editar beneficiário */}
      <BeneficiaryModal
        open={isModalOpen}
        onClose={() => handleCloseModal(true)}
        onSubmit={handleSaveBeneficiary}
        beneficiary={selectedBeneficiary}
        mode={modalMode}
        companies={companies}
        healthOperators={healthOperators}
      />

      {/* Toast de sucesso */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Toast de erro */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
