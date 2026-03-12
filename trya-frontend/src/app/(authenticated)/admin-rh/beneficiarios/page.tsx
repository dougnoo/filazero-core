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
  IconButton,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { beneficiaryService } from "./services/beneficiaryService";
import type {
  Beneficiary,
  BeneficiariesFilters,
  CreateBeneficiaryRequest,
  ImportResult,
} from "./types/beneficiary";
import { useTheme } from "@mui/material/styles";
import { useToast } from "@/shared/hooks/useToast";
import { BeneficiaryModal } from "./form-components";
import ImportErrorAlert from "./components/ImportErrorAlert";
import { tenantService } from "./services/tenantService";
import { healthOperatorService } from "./services/healthOperatorService";
import { StatusChip } from "@/shared/components/Table/StatusChip";
import { SearchButtonIcon } from "@/shared/components/icons/SearchButtonIcon";

// Ícone de adicionar/upload customizado
const ImportIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.1667 6.66667L10 2.5L5.83334 6.66667"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 2.5V12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
  const theme = useTheme();
  const { showSuccess, showError } = useToast();
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
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<Beneficiary | null>(null);

  // Estados para empresas e operadoras de saúde
  const [companies, setCompanies] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [healthOperators, setHealthOperators] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Estado para alert de erros de importação
  const [importErrorAlert, setImportErrorAlert] = useState<{
    open: boolean;
    errors: ImportResult | null;
  }>({
    open: false,
    errors: null,
  });

  // Estado para forçar refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // Carrega empresas e operadoras de saúde ao montar o componente
  useEffect(() => {
    const loadTenantCompaniesAndOperators = async () => {
      try {
        // Busca lista de empresas (tenants) ativas
        const tenants = await tenantService.listActive();
        const tenantOptions = tenants.map((tenant) => ({
          id: tenant.id,
          name: tenant.name,
        }));
        setCompanies(tenantOptions);

        // Busca lista de operadoras de saúde
        const operators = await healthOperatorService.list();
        const operatorOptions = operators.map((operator) => ({
          id: operator.id,
          name: operator.name,
        }));
        setHealthOperators(operatorOptions);
      } catch (error) {}
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
            : Math.ceil(totalCount / (filters.limit || 10))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar beneficiários"
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
  const handleOpenEditModal = async (beneficiary: Beneficiary) => {
    try {
      // Busca os dados completos do beneficiário antes de abrir o modal
      // A listagem retorna dados resumidos, então precisamos buscar os detalhes
      const fullBeneficiary = await beneficiaryService.getById(beneficiary.id);
      setModalMode("edit");
      setSelectedBeneficiary(fullBeneficiary);
      setIsModalOpen(true);
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados do beneficiário"
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBeneficiary(null);
    setModalMode("add");
  };

  const handleSaveBeneficiary = async (data: Partial<Beneficiary>) => {
    try {
      if (modalMode === "add") {
        // Se não há dados preenchidos, não faz nada (apenas importação de arquivo)
        const hasFormData = data.name || data.cpf || data.dateOfBirth || data.planId || data.tenantId;
        if (!hasFormData) {
          return; // Apenas importação de arquivo, não precisa validar formulário
        }

        // Valida campos obrigatórios apenas se houver dados no formulário
        if (
          !data.name ||
          !data.cpf ||
          !data.dateOfBirth ||
          !data.planId ||
          !data.tenantId
        ) {
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
          } else if (
            cleanPhone.startsWith("55") &&
            (cleanPhone.length === 12 || cleanPhone.length === 13)
          ) {
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
            birthDate = date.toISOString().split("T")[0];
          }
        }

        // Converte para o tipo esperado pela API
        const createData: CreateBeneficiaryRequest = {
          name: data.name.trim(),
          cpf: cleanCpf,
          birthDate: birthDate,
          tenantId: data.tenantId,
          planId: data.planId,
          gender: (data.gender as any) || "M",
          memberId: (data as any).memberId || "",
          beneficiaryType: (data.beneficiaryType as any) || "SELF",
        };

        await beneficiaryService.create(createData);
        // Mostra toast de sucesso
        showSuccess("Beneficiário cadastrado com sucesso!");
        // Recarrega a lista de beneficiários
        handleRefresh();
        // Fecha o modal sem limpar mensagens após um pequeno delay
        // para garantir que o toast apareça
        setTimeout(() => {
          handleCloseModal();
        }, 100);
      } else if (selectedBeneficiary) {
        // Para edição, converte os campos presentes
        // Garante que birthDate está no formato YYYY-MM-DD
        let birthDate = data.dateOfBirth;
        if (birthDate) {
          const date = new Date(birthDate);
          if (!isNaN(date.getTime())) {
            birthDate = date.toISOString().split("T")[0];
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
          } else if (
            cleanPhone.startsWith("55") &&
            (cleanPhone.length === 12 || cleanPhone.length === 13)
          ) {
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
          birthDate: birthDate,
          gender: data.gender,
          memberId: (data as any).memberId,
          dependentType: data.beneficiaryType,
        };

        await beneficiaryService.update(selectedBeneficiary.id, updateData);
        // Mostra toast de sucesso
        showSuccess("Beneficiário atualizado com sucesso!");
        // Recarrega a lista de beneficiários
        handleRefresh();
        // Fecha o modal sem limpar mensagens após um pequeno delay
        // para garantir que o toast apareça
        setTimeout(() => {
          handleCloseModal();
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
      showError(message);
      // Não fecha o modal quando há erro, para que o usuário possa ver a mensagem
      // Re-lança o erro para que o BeneficiaryModal possa resetar o loading
      throw error;
    }
  };

  const handleImportBeneficiaries = async (
    file: File
  ): Promise<ImportResult> => {
    try {
      const result = await beneficiaryService.importFromFile(file);

      // Mostra toast de sucesso se houver importações bem-sucedidas
      if (result.successCount > 0) {
        showSuccess(
          `${result.successCount} de ${result.totalRows} beneficiário(s) importado(s) com sucesso!`
        );
      }

      // Se houver erros, abre o alert de detalhes
      if (result.errorCount > 0) {
        setImportErrorAlert({
          open: true,
          errors: result,
        });
      }

      // Recarrega a lista apenas se houve algum sucesso
      if (result.successCount > 0) {
        handleRefresh();
      }

      // Fecha o modal após um delay
      setTimeout(() => {
        handleCloseModal();
      }, 100);

      return result;
    } catch (error: unknown) {
      let message = "Erro ao importar beneficiários.";
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }
      showError(message);
      throw error;
    }
  };

  const getStatusLabel = (active: boolean) => {
    return active ? "Ativo" : "Inativo";
  };

  // Mapa de cores para o StatusChip
  const STATUS_COLOR_MAP: Record<string, { color: string; bgColor: string }> = {
    active: { color: "#041616", bgColor: "#BCDF84" },
    inactive: { color: "#041616", bgColor: "#E5E7EB" },
  };

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
          {/* Botão de voltar */}
          <Box sx={{ mb: 2 }}>
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
              }}
            >
              <BackIcon />
            </IconButton>
          </Box>

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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "24px", md: "28px" },
                }}
              >
                Beneficiários
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "14px", md: "16px" },
                  color: "grey.700",
                }}
              >
                Listagem e edição de beneficiários
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<ImportIcon />}
              onClick={handleOpenAddModal}
              size="large"
            >
              Cadastrar beneficiários
            </Button>
          </Box>

          {/* Filters and Actions */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "flex-start" },
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
              fullWidth
              variant="outlined"
            />

            <FormControl
              sx={{
                minWidth: { xs: "100%", sm: 200 },
                bgcolor: "white",
                
              }}
            >
              <Select
                value={tempStatusFilter}
                onChange={handleStatusChange}
                displayEmpty
              >
                <MenuItem value="all">Todos os status</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilters}
              sx={{
                height: 56,
                width: 56,
                minWidth: 56,
                borderRadius: "8px",
                p: 0,
                flexShrink: 0,
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
                      <TableCell>Nome</TableCell>
                      <TableCell>CPF</TableCell>
                      <TableCell>Matrícula</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {beneficiaries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <Typography color="grey.800">
                            Nenhum beneficiário encontrado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      beneficiaries.map((beneficiary) => (
                        <TableRow
                          key={beneficiary.id}
                        >
                          <TableCell>{beneficiary.name}</TableCell>
                          <TableCell>{beneficiary.cpf}</TableCell>
                          <TableCell>{(beneficiary as any).memberId || "-"}</TableCell>
                          <TableCell>{(beneficiary as any).type || "-"}</TableCell>
                          <TableCell>
                            <StatusChip
                              status={beneficiary.active ? "active" : "inactive"}
                              label={getStatusLabel(beneficiary.active)}
                              colorMap={STATUS_COLOR_MAP}
                              showArrow={false}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              aria-label="Editar beneficiário"
                              onClick={() => handleOpenEditModal(beneficiary)}

                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="Visualizar beneficiário"
                              onClick={() =>
                                router.push(
                                  `/admin-rh/beneficiarios/${beneficiary.id}`
                                )
                              }
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
                        handlePageChange(
                          e as React.ChangeEvent<unknown>,
                          Math.max(1, filters.page! - 1)
                        )
                      }
                      disabled={filters.page === 1}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor:
                          filters.page === 1
                            ? "grey.200"
                            : "primary.main",
                        color: filters.page === 1 ? "#9CA3AF" : "primary.contrastText",
                        "&:hover": {
                          bgcolor:
                            filters.page === 1
                              ? "grey.300"
                              : "primary.dark",
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
                            : "primary.main",
                        color:
                          filters.page === totalPages ? "#9CA3AF" : "primary.contrastText",
                        "&:hover": {
                          bgcolor:
                            filters.page === totalPages
                              ? "#E5E7EB"
                              : "primary.dark",
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
                        total
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
        onClose={handleCloseModal}
        onSubmit={handleSaveBeneficiary}
        onImport={handleImportBeneficiaries}
        beneficiary={selectedBeneficiary}
        mode={modalMode}
        companies={companies}
        healthOperators={healthOperators}
      />

      {/* Alert de erros de importação */}
      {importErrorAlert.errors && (
        <ImportErrorAlert
          open={importErrorAlert.open}
          onClose={() =>
            setImportErrorAlert({ open: false, errors: null })
          }
          errors={importErrorAlert.errors.errors}
          totalErrors={importErrorAlert.errors.errorCount}
          successCount={importErrorAlert.errors.successCount}
          totalRows={importErrorAlert.errors.totalRows}
        />
      )}
    </Box>
  );
}
