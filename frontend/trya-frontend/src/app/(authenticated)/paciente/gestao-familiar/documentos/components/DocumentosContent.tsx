"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { AddButton } from "@/shared/components/Buttons";
import type {
  Document,
  FamilyMember,
  DocumentCatalogEntry,
  PaginatedDocuments,
  MedicalDocumentType,
  DocumentStatus,
} from "../types/document.types";
import { DocumentList } from "./DocumentList";
import { UploadDocumentModal } from "./UploadDocumentModal";

interface DocumentosContentProps {
  documents: Document[];
  pagination: PaginatedDocuments | null;
  currentPage: number;
  isLoading: boolean;
  members: FamilyMember[];
  selectedMemberId: string;
  catalog: DocumentCatalogEntry[];
  filterType: MedicalDocumentType | "";
  filterStatus: DocumentStatus | "";
  searchQuery: string;
  dateFrom: string | null;
  dateTo: string | null;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onUploadSuccess: () => void;
  onFilterChange: (
    type: MedicalDocumentType | "",
    status: DocumentStatus | "",
    query: string,
    from: string | null,
    to: string | null
  ) => void;
}

export function DocumentosContent({
  documents,
  pagination,
  currentPage,
  isLoading,
  members,
  selectedMemberId,
  catalog,
  filterType,
  filterStatus,
  searchQuery,
  dateFrom,
  dateTo,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onUploadSuccess,
  onFilterChange,
}: DocumentosContentProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localFilterType, setLocalFilterType] = useState<MedicalDocumentType | "">(filterType);
  const [localFilterStatus, setLocalFilterStatus] = useState<DocumentStatus | "">(filterStatus);
  const [localDateFrom, setLocalDateFrom] = useState<Dayjs | null>(
    dateFrom ? dayjs(dateFrom) : null
  );
  const [localDateTo, setLocalDateTo] = useState<Dayjs | null>(
    dateTo ? dayjs(dateTo) : null
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleUploadSuccess = () => {
    setSnackbar({
      open: true,
      message: "Documento enviado com sucesso!",
      severity: "success",
    });
    setIsUploadModalOpen(false);
    onUploadSuccess();
  };

  const handleSearch = () => {
    onFilterChange(
      localFilterType,
      localFilterStatus,
      localSearchQuery,
      localDateFrom ? localDateFrom.format("YYYY-MM-DD") : null,
      localDateTo ? localDateTo.format("YYYY-MM-DD") : null
    );
  };

  const handleClearFilters = () => {
    setLocalSearchQuery("");
    setLocalFilterType("");
    setLocalFilterStatus("");
    setLocalDateFrom(null);
    setLocalDateTo(null);
    onFilterChange("", "", "", null, null);
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        gap: 3,
      }}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#132F39" }}>
            Listagem de documentos
          </Typography>

          <Box sx={{ display: "flex", gap: 1.2 }}>
            <Button
              variant="text"
              onClick={() => setIsFilterOpen(true)}
              startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                color: "#6A7B80",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Filtros
            </Button>
            <AddButton label="Adicionar documento" onClick={() => setIsUploadModalOpen(true)} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: { xs: "16px", md: "8px" },
          border: "1px solid #E5E7EB",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "18px" },
              fontWeight: 600,
            }}
          >
            Documentos
          </Typography>
        </Box>

        <Box>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
                p: { xs: 2, md: 3 },
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          ) : documents.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: { xs: 2, md: 3 },
              }}
            >
              <Typography sx={{ color: "grey.800", mb: 2, fontSize: "14px" }}>
                Nenhum documento encontrado
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setIsUploadModalOpen(true)}
              >
                Adicionar primeiro documento
              </Button>
            </Box>
          ) : (
            <DocumentList
              documents={documents}
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={onPageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          )}
        </Box>
      </Box>

      <UploadDocumentModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        members={members}
        catalog={catalog}
        preSelectedMemberId={selectedMemberId}
      />

      <Dialog
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Filtros</Typography>
            <Button
              variant="text"
              onClick={handleClearFilters}
              sx={{ textTransform: "none", fontSize: 12 }}
            >
              Limpar filtros
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
              Filtrar por
            </Typography>
            <TextField
              select
              label="Tipo"
              value={localFilterType}
              onChange={(e) =>
                setLocalFilterType(e.target.value as MedicalDocumentType | "")
              }
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              {catalog.map((entry) => (
                <MenuItem key={entry.type} value={entry.type}>
                  {entry.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              value={localFilterStatus}
              onChange={(e) =>
                setLocalFilterStatus(e.target.value as DocumentStatus | "")
              }
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="VALID">Válido</MenuItem>
              <MenuItem value="EXPIRED">Vencido</MenuItem>
            </TextField>

            <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 1 }}>
              Buscar
            </Typography>
            <TextField
              label="Buscar por título ou categoria"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 1 }}>
              Período
            </Typography>
            <DatePicker
              value={localDateFrom}
              onChange={(newValue) => setLocalDateFrom(newValue)}
              label="Data de emissão"
              slotProps={{ textField: { size: "small" }, field: { clearable: true } }}
            />
            <DatePicker
              value={localDateTo}
              onChange={(newValue) => setLocalDateTo(newValue)}
              label="Data até"
              slotProps={{ textField: { size: "small" }, field: { clearable: true } }}
            />

            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setIsFilterOpen(false)}
                sx={{ textTransform: "none" }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handleSearch();
                  setIsFilterOpen(false);
                }}
                sx={{ textTransform: "none" }}
              >
                Aplicar filtros
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
