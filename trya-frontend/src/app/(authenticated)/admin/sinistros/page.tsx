"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRouter } from "next/navigation";
import BackButton from "@/shared/components/BackButton";
import { StatusChip } from "@/shared/components/Table/StatusChip";
import { useToast } from "@/shared/hooks/useToast";
import { ListingFilters, type StatusOption } from "@/shared/components/Filters";
import {
  claimsImportService,
  type ClaimImportRecord,
  type ImportsPagination,
} from "./services/claimsImportService";
import {
  CLAIMS_IMPORT_STATUS_COLOR_MAP,
  IMPORT_STATUS_LABEL_MAP,
  type ImportStatus,
} from "@/shared/constants/importStatus";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { ViewIcon } from "@/shared/components/icons";
import { TablePagination } from "@/shared/components/Table";

const claimStatusOptions: StatusOption[] = [
  { value: "completed", label: "Completo" },
  { value: "processing", label: "Processando" },
  { value: "failed", label: "Falha" },
];

export default function SinistrosPage() {
  const router = useRouter();
  const { showError } = useToast();

  const [imports, setImports] = useState<ClaimImportRecord[]>([]);
  const [pagination, setPagination] = useState<ImportsPagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedImport, setSelectedImport] = useState<ClaimImportRecord | null>(null);

  const loadImports = async (search: string, status: string, currentPage: number, limit: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await claimsImportService.listImports({ search, status, page: currentPage, limit });
      setImports(response.imports);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar importações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImports("", "all", 1, rowsPerPage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setPage(1);
    loadImports(searchTerm, statusFilter, 1, rowsPerPage);
  };

  const handleReprocess = async (imp: ClaimImportRecord) => {
    setImports((prev) =>
      prev.map((item) =>
        item.id === imp.id ? { ...item, status: "processing" as const } : item
      )
    );
    try {
      await claimsImportService.reprocessImport(imp.id);
      loadImports(searchTerm, statusFilter, page, rowsPerPage);
    } catch (err) {
      setImports((prev) =>
        prev.map((item) =>
          item.id === imp.id ? { ...item, status: "failed" as const } : item
        )
      );
      showError(err instanceof Error ? err.message : "Erro ao reprocessar importação");
    }
  };

  const handleViewDetails = (imp: ClaimImportRecord) => {
    setSelectedImport(imp);
    setOpenDetailsModal(true);
  };

  const handlePageChange = (value: number) => {
    setPage(value);
    loadImports(searchTerm, statusFilter, value, rowsPerPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setRowsPerPage(newSize);
    setPage(1);
    loadImports(searchTerm, statusFilter, 1, newSize);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
      <BackButton variant="icon-only" onClick={() => router.push('/admin')} />

      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Sinistros
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <ListingFilters
          searchValue={searchTerm}
          statusValue={statusFilter === "all" ? "" : statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={(value) => setStatusFilter(value || "all")}
          onSearch={handleSearch}
          onAction={() => router.push("/admin/sinistros/upload")}
          searchPlaceholder="Buscar por usuário"
          statusOptions={claimStatusOptions}
          actionType="import"
          actionLabel="Importar sinistro"
        />

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
                    <TableCell>Data</TableCell>
                    <TableCell>Arquivo</TableCell>
                    <TableCell>Usuário</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {imports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Typography color="grey.800">
                          Nenhuma importação encontrada. Clique em &quot;Importar sinistro&quot; para começar.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    imports.map((imp) => (
                      <TableRow key={imp.id}>
                        <TableCell>{imp.startedAt || "-"}</TableCell>
                        <TableCell>{imp.filename}</TableCell>
                        <TableCell>{imp.userName ?? "-"}</TableCell>
                        <TableCell>
                          <StatusChip
                            status={imp.status}
                            label={IMPORT_STATUS_LABEL_MAP[imp.status as ImportStatus] ?? imp.status}
                            colorMap={CLAIMS_IMPORT_STATUS_COLOR_MAP}
                            showArrow={false}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip
                            title={
                              imp.status === "failed"
                                ? "Reprocessar importação"
                                : "Disponível apenas para importações com falha"
                            }
                            arrow
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={imp.status !== "failed"}
                                onClick={() => handleReprocess(imp)}
                                aria-label="reprocessar"
                              >
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Visualizar detalhes" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(imp)}
                              aria-label="visualizar detalhes"
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

              {/* Pagination */}
              {imports.length > 0 && (
                <TablePagination
                  currentPage={page}
                  totalPages={Math.max(1, pagination.totalPages)}
                  totalItems={pagination.total}
                  itemsPerPage={rowsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handlePageSizeChange}
                />
              )}
            </>
          )}
        </TableContainer>
      </Stack>

      {/* Details Dialog */}
      <Dialog
        open={openDetailsModal}
        onClose={() => setOpenDetailsModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Detalhes da Importação</DialogTitle>
        <DialogContent>
          {selectedImport && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Data</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedImport.startedAt || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Arquivo</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedImport.filename}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Usuário</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedImport.userName ?? "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip
                    status={selectedImport.status}
                    label={IMPORT_STATUS_LABEL_MAP[selectedImport.status as ImportStatus] ?? selectedImport.status}
                    colorMap={CLAIMS_IMPORT_STATUS_COLOR_MAP}
                    showArrow={false}
                  />
                </Box>
              </Box>
              {selectedImport.errorMessage && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Mensagem de erro</Typography>
                  <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                    {selectedImport.errorMessage}
                  </Typography>
                </Box>
              )}
              {selectedImport.summary && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Resumo</Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    <Typography variant="body2">Total de linhas: {selectedImport.summary.totalRows}</Typography>
                    <Typography variant="body2">Sinistros importados: {selectedImport.summary.importedClaims}</Typography>
                    <Typography variant="body2">Correspondidos: {selectedImport.summary.matchedClaims}</Typography>
                    <Typography variant="body2">Sem correspondência: {selectedImport.summary.unmatchedClaims}</Typography>
                    <Typography variant="body2">
                      Confiança média: {Number(selectedImport.summary.avgMatchConfidence).toFixed(0)}%
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDetailsModal(false)} variant="outlined" sx={{ textTransform: "none" }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
