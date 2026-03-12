"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import type {
  Certificate,
  PaginatedCertificates,
} from "../types/certificate.types";
import { CertificateList } from "./CertificateList";
import { UploadModal } from "./UploadModal";

interface AtestadosContentProps {
  certificates: Certificate[];
  pagination: PaginatedCertificates | null;
  currentPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onUploadSuccess: () => void;
  onDateFilter: (date: string | null) => void;
}

export function AtestadosContent({
  certificates,
  pagination,
  currentPage,
  isLoading,
  onPageChange,
  onUploadSuccess,
  onDateFilter,
}: AtestadosContentProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
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
      message: "Atestado enviado com sucesso!",
      severity: "success",
    });
    setIsUploadModalOpen(false);
    onUploadSuccess();
  };

  const handleSearch = () => {
    onDateFilter(selectedDate ? selectedDate.format("YYYY-MM-DD") : null);
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
      {/* Box de Filtros */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        {/* Campo de Data + Botão Buscar */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flex: 1,
          }}
        >
          <DatePicker
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                placeholder: "Filtrar por data",
              },
              field: { clearable: true },
            }}
            label="Selecione a data"
          />

          {/* Botão Buscar */}
          <IconButton
            onClick={handleSearch}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              width: 56,
              height: 56,
              borderRadius: "8px",
              flexShrink: 0,
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            <SearchIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>

        {/* Botão Adicionar */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsUploadModalOpen(true)}
          sx={{
            fontWeight: 500,
            fontSize: { xs: "13px", md: "14px" },
            px: { xs: 2.5, md: 3 },
            py: { xs: "10px", md: "12px" },
            whiteSpace: "nowrap",
            height: 56,
          }}
        >
          Adicionar novo atestado
        </Button>
      </Box>

      {/* Card Principal - Conteúdo dos Atestados */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: { xs: "16px", md: "8px" },
          border: "1px solid #E5E7EB",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Título Atestado */}
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
            Atestado
          </Typography>
        </Box>

        {/* Conteúdo */}
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
              <CircularProgress color="primary"/>
            </Box>
          ) : certificates.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: { xs: 2, md: 3 },
              }}
            >
              <Typography
                sx={{ color: 'grey.800', mb: 2, fontSize: "14px" }}
              >
                Nenhum atestado encontrado
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setIsUploadModalOpen(true)}
              >
                Adicionar primeiro atestado
              </Button>
            </Box>
          ) : (
            <CertificateList
              certificates={certificates}
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />
          )}
        </Box>
      </Box>

      {/* Modal de Upload */}
      <UploadModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Snackbar */}
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
