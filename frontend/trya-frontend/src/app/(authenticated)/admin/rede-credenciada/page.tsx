"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Link,
  styled,
  Autocomplete,
  Tooltip,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { useDropzone } from "react-dropzone";
import {
  networkImportService,
  type HealthOperator,
  type ImportResult,
} from "./services/networkImportService";
import { ImportDetailsModal } from "./components/ImportDetailsModal";
import BackButton from "@/shared/components/BackButton";
import { ViewIcon, RefreshIcon, DownloadIcon } from "@/shared/components/icons";
import { ListingFilters, type StatusOption } from "@/shared/components/Filters";
import {
  StatusChip,
  TablePagination,
  tableContainerStyles,
  tableCellStyles,
  tableHeaderRowStyles,
  emptyTableCellStyles,
} from "@/shared/components/Table";
import { formatFileSize } from "@/shared/utils";
import {
  DEFAULT_IMPORT_STATUS_COLOR_MAP,
  IMPORT_STATUS_LABEL_MAP,
  type ImportStatus,
} from "@/shared/constants/importStatus";
import {
  ACCEPTED_FILE_EXTENSIONS,
  ACCEPTED_FILE_FORMATS_MAP,
  ACCEPTED_MIME_TYPES,
} from "@/shared/constants/fileFormats";

const networkStatusOptions: StatusOption[] = [
  { value: "completed", label: "Completo" },
  { value: "processing", label: "Processando" },
  { value: "failed", label: "Falha" },
];

interface ImportRecord {
  id: string;
  date: string;
  operatorName: string;
  userName: string;
  status: ImportStatus;
  operatorId?: string;
  errorMessage?: string;
  filename?: string;
  file?: File; // Arquivo original para reprocessamento
}

const STEPS = ["Selecione a operadora", "Upload", "Confirmação"];

// Lista de operadoras de saúde conhecidas no Brasil para autocomplete
const KNOWN_OPERATORS = [
  "Amil",
  "Bradesco Saúde",
  "SulAmérica",
  "Unimed",
  "Notre Dame Intermédica",
  "Hapvida",
  "Porto Seguro Saúde",
  "Golden Cross",
  "Prevent Senior",
  "Seguros Unimed",
  "Assim Saúde",
  "Care Plus",
  "Cassi",
  "Geap Saúde",
  "Omint",
  "One Health",
  "Mediservice",
  "Saúde Caixa",
  "Petrobras Distribuidora",
  "Vale Saúde",
  "Vitallis",
  "Allianz Saúde",
  "Blue Med",
  "Capesesp",
  "Central Nacional Unimed",
  "Economus",
  "Fundação Copel",
  "Grupo NotreDame Intermédica",
  "Medial Saúde",
  "Saúde Bradesco",
  "Tempo Saúde",
  "Trasmontano",
  "Unimed BH",
  "Unimed Campinas",
  "Unimed Curitiba",
  "Unimed Fortaleza",
  "Unimed Goiânia",
  "Unimed João Pessoa",
  "Unimed Natal",
  "Unimed Paulistana",
  "Unimed Porto Alegre",
  "Unimed Recife",
  "Unimed Rio",
  "Unimed Salvador",
  "Unimed Santos",
  "Unimed São José do Rio Preto",
  "Unimed Vitória",
].sort();

// Custom Stepper Components
const StepperContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 0,
  marginBottom: 32,
});

const StepCircle = styled(Box)<{ active?: boolean; completed?: boolean }>(
  ({ theme, active, completed }) => ({
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.3s ease",
    ...(completed
      ? {
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
      }
      : active
        ? {
          backgroundColor: theme.palette.primary.main,
          color: "#fff",
        }
        : {
          backgroundColor: "#E5E7EB",
          color: "#9CA3AF",
        }),
  })
);

const StepLine = styled(Box)<{ completed?: boolean }>(({ completed }) => ({
  width: 80,
  height: 2,
  backgroundColor: completed ? "#0F4C4C" : "#E5E7EB",
  transition: "all 0.3s ease",
}));

export default function NetworkImportPage() {
  // Dashboard state
  const [view, setView] = useState<"dashboard" | "wizard">("dashboard");
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingImports, setLoadingImports] = useState(false);

  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [operators, setOperators] = useState<HealthOperator[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [snackbarError, setSnackbarError] = useState<string | null>(null);
  const [, setResult] = useState<ImportResult | null>(null);

  // Modal cadastro operadora
  const [openNewOperatorModal, setOpenNewOperatorModal] = useState(false);
  const [newOperatorName, setNewOperatorName] = useState("");
  const [creatingOperator, setCreatingOperator] = useState(false);

  // Modal visualizar detalhes
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedImport, setSelectedImport] = useState<ImportRecord | null>(null);

  // Ref para controlar o polling sem causar re-renderização
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingErrorCountRef = useRef(0);
  const MAX_POLLING_ERRORS = 3;
  const STALE_IMPORT_MINUTES = 30;

  const mapImportResultToRecord = useCallback(
    (imp: ImportResult, now: Date): ImportRecord => {
      let status = imp.status;
      let errorMessage = imp.errorMessage;

      if (status === "processing" && imp.startedAt) {
        const startedAt = new Date(imp.startedAt);
        const minutesElapsed = (now.getTime() - startedAt.getTime()) / (1000 * 60);
        if (minutesElapsed > STALE_IMPORT_MINUTES) {
          status = "failed";
          errorMessage = `Importação travada (iniciada há mais de ${STALE_IMPORT_MINUTES} minutos). Tente reprocessar.`;
        }
      }

      return {
        id: imp.id,
        date: imp.startedAt ? new Date(imp.startedAt).toLocaleDateString("pt-BR") : "-",
        operatorName: (imp as unknown as { operatorName?: string }).operatorName || "Sem operadora",
        userName: "Usuário do sistema",
        status,
        operatorId: (imp as unknown as { operatorId?: string }).operatorId,
        errorMessage,
        filename: imp.filename,
      };
    },
    []
  );

  const loadOperators = useCallback(async () => {
    setLoadingOperators(true);
    try {
      const list = await networkImportService.listOperators();
      setOperators(list);
    } catch {
      setError("Erro ao carregar operadoras");
    } finally {
      setLoadingOperators(false);
    }
  }, []);

  const loadImports = useCallback(async () => {
    setLoadingImports(true);
    try {
      const response = await networkImportService.listImports();
      if (response.success && response.imports) {
        const now = new Date();
        const formattedImports = response.imports.map((imp) =>
          mapImportResultToRecord(imp, now)
        );
        setImports(formattedImports);
        pollingErrorCountRef.current = 0;
      }
    } catch (err) {
      pollingErrorCountRef.current += 1;
      console.error("Erro ao carregar importações:", err);

      if (pollingErrorCountRef.current >= MAX_POLLING_ERRORS) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        console.warn("Polling desabilitado após múltiplas falhas");
      }
    } finally {
      setLoadingImports(false);
    }
  }, [mapImportResultToRecord]);

  // Carrega operadoras e imports ao montar o componente
  useEffect(() => {
    loadOperators();
    loadImports();
  }, [loadOperators, loadImports]);

  // Polling para atualizar status de importações em processamento
  useEffect(() => {
    const hasProcessing = imports.some((imp) => imp.status === "processing");
    
    if (hasProcessing && !pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        loadImports();
      }, 5000);
    } else if (!hasProcessing && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      pollingErrorCountRef.current = 0;
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [imports, loadImports]);

  // Valida se o arquivo tem formato aceito
  const validateFileFormat = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ACCEPTED_FILE_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    const hasValidMimeType = (ACCEPTED_MIME_TYPES as readonly string[]).includes(
      file.type
    );
    return hasValidExtension || hasValidMimeType;
  };

  // Dropzone
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      // Se há arquivos rejeitados, mostra erro
      if (rejectedFiles && rejectedFiles.length > 0) {
        setError(
          `Formato de arquivo não suportado. Use apenas arquivos .csv, .xls ou .xlsx`
        );
        return;
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];

        // Validação adicional do formato
        if (!validateFileFormat(selectedFile)) {
          setError(
            `Formato de arquivo não suportado: "${selectedFile.name}". Use apenas arquivos .csv, .xls ou .xlsx`
          );
          return;
        }

        setError(null);
        setFile(selectedFile);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_FORMATS_MAP,
    maxFiles: 1,
    disabled: loading,
    onDropRejected: (fileRejections) => {
      if (fileRejections.length > 0) {
        const fileName = fileRejections[0]?.file?.name || "arquivo";
        setError(
          `Formato de arquivo não suportado: "${fileName}". Use apenas arquivos .csv, .xls ou .xlsx`
        );
      }
    },
  });

  // Handlers
  const handleStartImport = () => {
    setView("wizard");
    setActiveStep(0);
    setSelectedOperatorId("");
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      setView("dashboard");
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedOperatorId) {
      setError("Selecione uma operadora para continuar");
      return;
    }
    if (activeStep === 1 && !file) {
      setError("Selecione um arquivo para continuar");
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleProcessImport = async () => {
    if (!selectedOperatorId || !file) {
      setError("Operadora e arquivo são obrigatórios");
      return;
    }

    const selectedOp = operators.find((op) => op.id === selectedOperatorId);
    if (!selectedOp) {
      setError("Operadora não encontrada");
      return;
    }

    // Validação final do formato do arquivo antes de enviar
    if (!validateFileFormat(file)) {
      setError(
        `Formato de arquivo não suportado: "${file.name}". Use apenas arquivos .csv, .xls ou .xlsx`
      );
      return;
    }

    // Salva o arquivo atual antes de limpar o estado
    // file já foi verificado acima, então não pode ser null aqui
    const currentFile: File = file;

    // Cria um registro temporário de importação com status "processing"
    const tempImportId = `temp-${Date.now()}`;
    const tempImport: ImportRecord = {
      id: tempImportId,
      date: new Date().toLocaleDateString("pt-BR"),
      operatorName: selectedOp.name,
      userName: "Usuário do sistema",
      status: "processing",
      operatorId: selectedOperatorId,
      file: currentFile, // Salva o arquivo para possível reprocessamento
      filename: currentFile.name,
    };

    // Adiciona o registro temporário à lista e volta para o dashboard imediatamente
    setImports((prev) => [tempImport, ...prev]);
    setView("dashboard");
    setActiveStep(0);
    setSelectedOperatorId("");
    setFile(null);
    setError(null);

    // Processa a importação em background
    try {
      setLoading(true);
      const importResult = await networkImportService.importNetwork(
        selectedOperatorId,
        selectedOp.name,
        currentFile
      );
      setResult(importResult);

      // Atualiza a lista removendo o registro temporário e recarregando do servidor
      await loadImports();
    } catch (err) {
      // Extrai a mensagem de erro do response
      let errorMessage = "Erro ao importar rede credenciada";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = String(err.message);
      }
      
      // Em caso de erro, atualiza o registro temporário para "failed" com a mensagem de erro
      setImports((prev) =>
        prev.map((imp) =>
          imp.id === tempImportId
            ? { 
                ...imp, 
                status: "failed" as ImportStatus,
                errorMessage: errorMessage,
                file: currentFile, // Mantém o arquivo para reprocessamento
              }
            : imp
        )
      );
      
      // Mostra o erro no Snackbar (toastr)
      setSnackbarError(errorMessage);
      // Também mantém o erro no estado para exibição no wizard se necessário
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handler para visualizar detalhes da importação
  const handleViewDetails = async (imp: ImportRecord) => {
    // Busca detalhes completos da importação se tiver ID
    if (imp.id && !imp.id.startsWith("temp-")) {
      try {
        // Busca todas as importações para encontrar a específica
        const response = await networkImportService.listImports(imp.operatorId);
        if (response.success && response.imports) {
          const fullImport = response.imports.find((i) => i.id === imp.id);
          if (fullImport) {
            setSelectedImport({
              ...imp,
              errorMessage: fullImport.errorMessage,
              filename: fullImport.filename,
            });
          } else {
            setSelectedImport(imp);
          }
        } else {
          setSelectedImport(imp);
        }
      } catch {
        // Se falhar ao buscar detalhes, usa os dados que já temos
        setSelectedImport(imp);
      }
    } else {
      setSelectedImport(imp);
    }
    setOpenDetailsModal(true);
  };

  // Handler para baixar arquivo de importação
  const handleDownload = async (imp: ImportRecord) => {
    if (!imp.id || imp.id.startsWith("temp-")) {
      setSnackbarError("Arquivo não disponível para download");
      return;
    }

    if (!imp.filename) {
      setSnackbarError("Nome do arquivo não encontrado");
      return;
    }

    setLoading(true);
    try {
      await networkImportService.downloadImportFile(imp.id, imp.filename);
    } catch (err) {
      let errorMessage = "Erro ao baixar arquivo";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = String(err.message);
      }
      setSnackbarError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handler para reprocessar importação
  const handleReprocess = async (imp: ImportRecord) => {
    // Fecha o modal de detalhes se estiver aberto
    setOpenDetailsModal(false);

    // Se a importação tem ID (não é temporária), tenta reprocessar usando o arquivo do S3
    if (imp.id && !imp.id.startsWith("temp-")) {
      setLoading(true);
      // Declara tempImportId antes do try para garantir que está disponível no catch
      const tempImportId = `temp-${Date.now()}`;
      let tempImportCreated = false;
      
      try {
        // Cria registro temporário de processamento
        const tempImport: ImportRecord = {
          id: tempImportId,
          date: new Date().toLocaleDateString("pt-BR"),
          operatorName: imp.operatorName,
          userName: "Usuário do sistema",
          status: "processing",
          operatorId: imp.operatorId,
        };
        setImports((prev) => [tempImport, ...prev]);
        tempImportCreated = true;
        setView("dashboard");

        // Reprocessa usando o endpoint do backend que busca o arquivo do S3
        const result = await networkImportService.reprocessImport(imp.id);
        setResult(result);

        // Atualiza a lista removendo o registro temporário e recarregando do servidor
        await loadImports();
      } catch (err) {
        // Em caso de erro, atualiza o registro temporário para "failed" apenas se foi criado
        if (tempImportCreated) {
          setImports((prev) =>
            prev.map((importItem) =>
              importItem.id === tempImportId
                ? { ...importItem, status: "failed" as ImportStatus }
                : importItem
            )
          );
        }

        let errorMessage = "Erro ao reprocessar importação";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "object" && err !== null && "message" in err) {
          errorMessage = String(err.message);
        }

        setSnackbarError(errorMessage);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback: se não tem ID ou é temporária, usa o fluxo antigo
    // Garante que operadoras estão carregadas
    let currentOperators = operators;
    if (operators.length === 0) {
      setLoadingOperators(true);
      try {
        const list = await networkImportService.listOperators();
        setOperators(list);
        currentOperators = list;
      } catch {
        setSnackbarError("Erro ao carregar operadoras");
        return;
      } finally {
        setLoadingOperators(false);
      }
    }
    
    const operator = currentOperators.find((op) => op.name === imp.operatorName);
    if (!operator) {
      setSnackbarError("Operadora não encontrada. Por favor, selecione uma operadora válida.");
      return;
    }
    
    setSelectedOperatorId(operator.id);
    setError(null);
    
    // Se temos o arquivo salvo, vai direto para confirmação e processa automaticamente
    if (imp.file) {
      setFile(imp.file);
      setView("wizard");
      setActiveStep(2); // Vai direto para confirmação
      // Processa automaticamente após um pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        handleProcessImport();
      }, 100);
    } else {
      // Se não temos o arquivo, vai para o passo de upload
      setView("wizard");
      setActiveStep(1);
      setFile(null);
      setSnackbarError("Arquivo não encontrado. Por favor, faça upload novamente.");
    }
  };

  const handleCreateOperator = async () => {
    if (!newOperatorName.trim()) return;

    setCreatingOperator(true);
    setModalError(null);
    try {
      await networkImportService.createOperator(newOperatorName.trim());
      await loadOperators();
      setOpenNewOperatorModal(false);
      setNewOperatorName("");
      setModalError(null);
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Erro ao cadastrar operadora"
      );
    } finally {
      setCreatingOperator(false);
    }
  };

  const getStatusChip = (status: ImportStatus) => (
    <StatusChip
      status={status}
      label={IMPORT_STATUS_LABEL_MAP[status]}
      colorMap={DEFAULT_IMPORT_STATUS_COLOR_MAP}
      showArrow={false}
    />
  );

  const filteredImports = imports.filter((imp) => {
    const matchesSearch =
      imp.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || imp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedOperator = operators.find((op) => op.id === selectedOperatorId);

  // Custom Stepper Render
  const renderStepper = () => (
    <StepperContainer>
      {STEPS.map((_, index) => (
        <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
          <StepCircle
            active={activeStep === index}
            completed={activeStep > index}
          >
            {activeStep > index ? (
              <CheckIcon sx={{ fontSize: 18 }} />
            ) : (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: activeStep === index ? "#fff" : "#9CA3AF",
                }}
              />
            )}
          </StepCircle>
          {index < STEPS.length - 1 && (
            <StepLine completed={activeStep > index} />
          )}
        </Box>
      ))}
    </StepperContainer>
  );

  // Dashboard View
  if (view === "dashboard") {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <BackButton variant="icon-only" />
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Redes credenciadas
          </Typography>

          {/* Filters */}
          <ListingFilters
            searchValue={searchTerm}
            statusValue={statusFilter === "all" ? "" : statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={(value) => setStatusFilter(value || "all")}
            onSearch={() => {}}
            onAction={handleStartImport}
            searchPlaceholder="Buscar por operadora ou usuário"
            statusOptions={networkStatusOptions}
            actionType="import"
            actionLabel="Importar rede credenciada"
          />

          {/* Table */}
          <TableContainer
            component={Paper}
            sx={tableContainerStyles}
          >
            {loadingImports ? (
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
                <Table sx={tableCellStyles}>
                  <TableHead>
                    <TableRow sx={tableHeaderRowStyles}>
                      <TableCell>Data</TableCell>
                      <TableCell>Operadora</TableCell>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                      </TableHead>
                  <TableBody>
                    {filteredImports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={emptyTableCellStyles}>
                          <Typography color="grey.800">
                            Nenhuma importação encontrada
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredImports
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((imp) => (
                          <TableRow key={imp.id}>
                            <TableCell>{imp.date}</TableCell>
                            <TableCell>{imp.operatorName}</TableCell>
                            <TableCell>{imp.userName}</TableCell>
                            <TableCell>{getStatusChip(imp.status)}</TableCell>
                            <TableCell align="center">
                              <Tooltip
                                title={
                                  imp.status === "failed"
                                    ? "Reprocessar importação"
                                    : "Reprocessamento disponível apenas para importações com falha"
                                }
                                arrow
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={imp.status !== "failed"}
                                    sx={{
                                      color: imp.status === "failed" ? "text.secondary" : "action.disabled",
                                    }}
                                    onClick={() => handleReprocess(imp)}
                                  >
                                    <RefreshIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Visualizar detalhes" arrow>
                                <IconButton
                                  size="small"
                                  sx={{ color: "text.secondary" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(imp);
                                  }}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Baixar arquivo" arrow>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={!imp.id || imp.id.startsWith("temp-")}
                                    sx={{
                                      color: imp.id && !imp.id.startsWith("temp-") ? "text.secondary" : "action.disabled",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(imp);
                                    }}
                                  >
                                    <DownloadIcon size={16} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {filteredImports.length > 0 && (
                  <TablePagination
                    currentPage={page + 1}
                    totalPages={Math.max(1, Math.ceil(filteredImports.length / rowsPerPage))}
                    totalItems={filteredImports.length}
                    itemsPerPage={rowsPerPage}
                    onPageChange={(nextPage) => setPage(nextPage - 1)}
                    onItemsPerPageChange={(items) => {
                      setRowsPerPage(items);
                      setPage(0);
                    }}
                  />
                )}
              </>
            )}
          </TableContainer>
        </Stack>

        {/* Snackbar para notificações de erro - Dashboard View */}
        <Snackbar
          open={!!snackbarError}
          autoHideDuration={10000}
          onClose={() => setSnackbarError(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{
            "& .MuiSnackbarContent-root": {
              maxWidth: 600,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
          }}
        >
          <Alert
            onClose={() => setSnackbarError(null)}
            severity="error"
            sx={{ width: "100%", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {snackbarError}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Wizard View
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
      <Stack spacing={3}>
        {/* Back button */}
        <IconButton
          onClick={handleBack}
          sx={{
            alignSelf: "flex-start",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 1,
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* Title */}
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Importar rede credenciada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Faça o upload da planilha da rede credenciada associando a uma
            operadora.
          </Typography>
        </Box>

        {/* Wizard Card */}
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            {/* Custom Stepper */}
            {renderStepper()}

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            {/* Step 1: Selecione a operadora */}
            {activeStep === 0 && (
              <Stack spacing={3}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Selecione a operadora
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Caso a operadora não esteja listada, cadastre uma nova.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenNewOperatorModal(true)}
                    sx={{
                      borderRadius: 1,
                      textTransform: "none",
                      fontWeight: 500,
                      bgcolor: "#0F4C4C",
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "#0A3A3A",
                      },
                    }}
                  >
                    Cadastrar operadora
                  </Button>
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Selecione...</InputLabel>
                  <Select
                    value={selectedOperatorId}
                    label="Selecione..."
                    onChange={(e) => setSelectedOperatorId(e.target.value)}
                    disabled={loadingOperators}
                    sx={{ borderRadius: 2 }}
                    endAdornment={
                      loadingOperators ? (
                        <CircularProgress size={20} sx={{ mr: 4 }} />
                      ) : null
                    }
                  >
                    {operators.map((op) => (
                      <MenuItem key={op.id} value={op.id}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {op.name}
                          {op.status === "REDE_CREDENCIADA_DISPONIVEL" && (
                            <Chip
                              label="Rede disponível"
                              size="small"
                              sx={{
                                bgcolor: "#BCDF84",
                                color: "#041616",
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!selectedOperatorId}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Continuar
                  </Button>
                </Box>
              </Stack>
            )}

            {/* Step 2: Upload */}
            {activeStep === 1 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Envie uma planilha Excel (.xlsx) seguindo o template
                    oficial.
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "center" }}>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_ASSETS_CDN_URL || ""}/templates/rede-credenciada-template.xlsx`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      cursor: "pointer",
                      color: "text.secondary",
                      textDecoration: "underline",
                      fontSize: 14,
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Baixe aqui o template da planilha para importação
                  </Link>
                </Box>

                {/* Dropzone */}
                <Paper
                  {...getRootProps()}
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: "center",
                    cursor: "pointer",
                    border: "2px dashed",
                    borderColor: isDragActive ? "primary.main" : "#E5E7EB",
                    borderRadius: 3,
                    backgroundColor: isDragActive ? "#F0FDF4" : "#FAFAFA",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "#F0FDF4",
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon
                    sx={{ fontSize: 48, color: "#9CA3AF", mb: 2 }}
                  />
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    color="text.primary"
                    gutterBottom
                  >
                    {file
                      ? file.name
                      : isDragActive
                        ? "Solte o arquivo aqui..."
                        : "Selecione um arquivo ou arraste e solte aqui"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 2 }}
                  >
                    Arquivo .csv ou .xls
                  </Typography>
                  {!file && (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 500,
                        px: 3,
                      }}
                    >
                      Selecione o arquivo
                    </Button>
                  )}
                </Paper>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!file}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Continuar
                  </Button>
                </Box>
              </Stack>
            )}

            {/* Step 3: Confirmação */}
            {activeStep === 2 && (
              <Stack spacing={4} alignItems="center">
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 4, md: 8 },
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="text.primary"
                      sx={{ mb: 1 }}
                    >
                      Operadora selecionada
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        {selectedOperator?.name || "[NOME DA OPERADORA]"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setActiveStep(0)}
                        sx={{ color: "text.secondary" }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="text.primary"
                      sx={{ mb: 1 }}
                    >
                      Arquivo selecionado
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        {file?.name || "[NOME DO ARQUIVO]"}
                        {file && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.disabled"
                            sx={{ ml: 1 }}
                          >
                            {formatFileSize(file.size)}
                          </Typography>
                        )}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setActiveStep(1)}
                        sx={{ color: "text.secondary" }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "center" }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setView("dashboard")}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 500,
                      borderColor: "divider",
                      color: "text.primary",
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleProcessImport}
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : null
                    }
                  >
                    {loading ? "Processando..." : "Processar importação"}
                  </Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Modal: Cadastrar operadora */}
      <Dialog
        open={openNewOperatorModal}
        onClose={() => {
          setOpenNewOperatorModal(false);
          setModalError(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Cadastrar operadora</DialogTitle>
        <DialogContent>
          {modalError && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: 2 }}
              onClose={() => setModalError(null)}
            >
              {modalError}
            </Alert>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            Nome da operadora*
          </Typography>
          <Autocomplete
            freeSolo
            options={KNOWN_OPERATORS}
            value={newOperatorName}
            onChange={(_, newValue) => setNewOperatorName(newValue || "")}
            onInputChange={(_, newInputValue) => setNewOperatorName(newInputValue)}
            disabled={creatingOperator}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                fullWidth
                placeholder="Digite para buscar ou selecione"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
            noOptionsText="Nenhuma operadora encontrada"
            sx={{ width: "100%" }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Selecione uma operadora da lista ou digite um nome personalizado
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setOpenNewOperatorModal(false);
              setModalError(null);
            }}
            disabled={creatingOperator}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              color: "text.primary",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateOperator}
            variant="contained"
            disabled={!newOperatorName.trim() || creatingOperator}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              fontWeight: 600,
            }}
          >
            {creatingOperator ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ImportDetailsModal
        open={openDetailsModal}
        onClose={() => setOpenDetailsModal(false)}
        selectedImport={selectedImport}
        onDownload={handleDownload}
        onReprocess={handleReprocess}
        renderStatusChip={getStatusChip}
      />

      {/* Snackbar para notificações de erro */}
      <Snackbar
        open={!!snackbarError}
        autoHideDuration={10000}
        onClose={() => setSnackbarError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            maxWidth: 600,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          },
        }}
      >
        <Alert
          onClose={() => setSnackbarError(null)}
          severity="error"
          sx={{ width: "100%", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {snackbarError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
