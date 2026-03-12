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
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useTheme } from "@/shared/hooks/useTheme";
import type { Certificate, PaginatedCertificates } from "../types/certificate.types";
import { CertificateStatus } from "../types/certificate.types";
import { CertificateList } from "./CertificateList";
import { UploadModal } from "./UploadModal";

interface AtestadosContentProps {
  certificates: Certificate[];
  pagination: PaginatedCertificates | null;
  currentPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onUploadSuccess: () => void;
  onRefresh: () => void;
}

// Ícone de adicionar
const AddIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0.925713V23.2114" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M0.857178 12H23.1429" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function AtestadosContent({
  certificates,
  pagination,
  currentPage,
  isLoading,
  onPageChange,
  onUploadSuccess,
  onRefresh,
}: AtestadosContentProps) {
  const theme = useThemeColors();
  const { theme: currentTheme } = useTheme();
  const isDefaultTheme = currentTheme?.id === 'default';
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
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

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {/* Header com Ícone e Título */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        {/* Header com ícone, título e botão */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Ícone */}
            <Box
              sx={{
                width: { xs: 48, md: 56 },
                height: { xs: 48, md: 56 },
                borderRadius: "12px",
                backgroundColor: isDefaultTheme ? theme.secondary : theme.iconBackground,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M26.7443 15.5441V21.0882C26.7443 21.6296 26.3054 22.0685 25.7639 22.0685H2.23636C1.69494 22.0685 1.25604 21.6296 1.25604 21.0882V5.40317C1.25604 4.86176 1.69494 4.42285 2.23636 4.42285H6.68452"
                  stroke={isDefaultTheme ? theme.white : theme.primary}
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.0396 22.0688L10.079 26.9704"
                  stroke={isDefaultTheme ? theme.white : theme.primary}
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.9608 22.0688L17.9214 26.9704"
                  stroke={isDefaultTheme ? theme.white : theme.primary}
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.11823 26.9702H19.882"
                  stroke={isDefaultTheme ? theme.white : theme.primary}
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.8639 1.17139H17.9616C18.2528 1.17139 18.532 1.28705 18.7379 1.49292C18.9437 1.69879 19.0594 1.97802 19.0594 2.26916V5.27978C19.0594 6.44437 18.5967 7.56126 17.7733 8.38475C16.9498 9.20824 15.8329 9.67087 14.6683 9.67087C13.5038 9.67087 12.3868 9.20824 11.5633 8.38475C10.7399 7.56126 10.2772 6.44437 10.2772 5.27978V2.26916C10.2772 1.97802 10.3929 1.69879 10.5988 1.49292C10.8046 1.28705 11.0839 1.17139 11.375 1.17139H12.4728"
                  stroke={isDefaultTheme ? theme.white : theme.primary}
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M24.5485 7.47532C25.761 7.47532 26.744 6.49234 26.744 5.27978C26.744 4.06722 25.761 3.08423 24.5485 3.08423C23.3358 3.08423 22.3529 4.06722 22.3529 5.27978C22.3529 6.49234 23.3358 7.47532 24.5485 7.47532Z"
                  stroke={isDefaultTheme ? theme.white : theme.primary}
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.6682 9.67064V10.2195C14.6682 11.5297 15.1887 12.7862 16.115 13.7126C17.0414 14.6391 18.2979 15.1595 19.6081 15.1595C20.9183 15.1595 22.1748 14.6391 23.1012 13.7126C24.0277 12.7862 24.5481 11.5297 24.5481 10.2195V7.4751"
                  stroke={isDefaultTheme ? theme.white : theme.primary}
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>

            {/* Título e Descrição */}
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "18px", md: "20px" },
                  fontWeight: 600,
                  color: theme.textDark,
                  lineHeight: "28px",
                  letterSpacing: "-0.4px",
                  mb: 0.5,
                }}
              >
                Atestados
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "13px", md: "14px" },
                  color: theme.textMuted,
                  lineHeight: "20px",
                }}
              >
                Verifique a autenticidade de um atestado
              </Typography>
            </Box>
          </Box>

          {/* Botão Adicionar */}
          <Button
            variant="contained"
            onClick={() => setIsUploadModalOpen(true)}
            sx={{
              backgroundColor: isDefaultTheme ? theme.secondary : theme.primary,
              color: isDefaultTheme ? theme.white : theme.white,
              textTransform: "none",
              fontWeight: 500,
              fontSize: { xs: "13px", md: "14px" },
              px: { xs: 2.5, md: 3 },
              py: { xs: "10px", md: "12px" },
              borderRadius: "8px",
              boxShadow: "none",
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: isDefaultTheme ? theme.secondary : theme.primary,
                opacity: 0.9,
                boxShadow: "none",
              },
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AddIcon />
            Adicionar novo atestado
          </Button>
        </Box>
      </Box>

      {/* Card Principal - Conteúdo dos Atestados */}
      <Box
        sx={{
          bgcolor: theme.cardBackground,
          borderRadius: { xs: "16px", md: "8px" },
          border: { xs: `1px solid ${theme.softBorder}`, md: "none" },
          display: "flex",
          flexDirection: "column",
          fontFamily: theme.fontFamily,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Filtros e Busca */}
        <Box
          sx={{
            p: { xs: "16px 20px", md: "20px 24px" },
            borderBottom: `1px solid ${theme.softBorder}`,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          {/* Seleção de Data */}
          <TextField
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            placeholder="Selecione a data"
            sx={{
              flex: 1,
              maxWidth: { sm: "240px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.white,
                borderRadius: "8px",
                fontSize: { xs: "13px", md: "14px" },
                "& fieldset": {
                  borderColor: theme.softBorder,
                },
                "&:hover fieldset": {
                  borderColor: theme.primary,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.primary,
                },
              },
              "& .MuiInputBase-input": {
                color: selectedDate ? theme.textDark : theme.textMuted,
                fontSize: { xs: "13px", md: "14px" },
                py: 1.5,
                "&::placeholder": {
                  color: theme.textMuted,
                  opacity: 1,
                },
              },
            }}
          />

          {/* Seleção de Status */}
          <FormControl
            sx={{
              flex: 1,
              maxWidth: { sm: "240px" },
            }}
          >
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: theme.white,
                borderRadius: "8px",
                fontSize: { xs: "13px", md: "14px" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.softBorder,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.primary,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.primary,
                },
                "& .MuiSelect-select": {
                  py: 1.5,
                  color: selectedStatus ? theme.textDark : theme.textMuted,
                  fontSize: { xs: "13px", md: "14px" },
                },
              }}
            >
              <MenuItem value="" disabled>
                <Typography sx={{ fontSize: { xs: "13px", md: "14px" }, color: theme.textMuted }}>
                  Selecione o status
                </Typography>
              </MenuItem>
              <MenuItem value={CertificateStatus.PENDING}>
                <Typography sx={{ fontSize: { xs: "13px", md: "14px" } }}>Em análise</Typography>
              </MenuItem>
              <MenuItem value={CertificateStatus.APPROVED}>
                <Typography sx={{ fontSize: { xs: "13px", md: "14px" } }}>Aprovado</Typography>
              </MenuItem>
              <MenuItem value={CertificateStatus.REJECTED}>
                <Typography sx={{ fontSize: { xs: "13px", md: "14px" } }}>Reprovado</Typography>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Botão de Busca */}
          <Button
            variant="contained"
            onClick={() => {
              // TODO: Implementar filtro
              console.log("Filtrar por:", { selectedDate, selectedStatus });
            }}
            sx={{
              width: { xs: "100%", sm: 48 },
              height: 48,
              minWidth: { sm: 48 },
              bgcolor: isDefaultTheme ? theme.secondary : theme.primary,
              borderRadius: "8px",
              p: 0,
              flexShrink: 0,
              boxShadow: "none",
              "&:hover": {
                bgcolor: isDefaultTheme ? theme.secondary : theme.primary,
                opacity: 0.9,
                boxShadow: "none",
              },
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </Box>

        {/* Cabeçalho da Tabela */}
        <Box
          sx={{
            p: { xs: "12px 20px", md: "16px 24px" },
            borderBottom: `1px solid ${theme.softBorder}`,
            bgcolor: isDefaultTheme ? theme.chipBackground : 'transparent',
            display: { xs: "none", md: "flex" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              color: theme.textDark,
              flex: 1,
            }}
          >
            Atestado
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              color: theme.textDark,
              width: 120,
              textAlign: "center",
            }}
          >
            Status
          </Typography>
          <Box sx={{ width: 40 }} />
        </Box>

        {/* Conteúdo */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: { xs: "20px", md: "24px" },
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#9CA3AF",
              borderRadius: "3px",
              "&:hover": {
                bgcolor: "#6B7280",
              },
            },
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress sx={{ color: theme.primary }} />
            </Box>
          ) : certificates.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
              }}
            >
              <Typography sx={{ color: theme.textMuted, mb: 2, fontSize: "14px" }}>
                Nenhum atestado encontrado
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setIsUploadModalOpen(true)}
                sx={{
                  color: isDefaultTheme ? theme.secondary : theme.primary,
                  borderColor: theme.softBorder,
                  textTransform: "none",
                  fontSize: "14px",
                  "&:hover": {
                    borderColor: isDefaultTheme ? theme.secondary : theme.primary,
                    backgroundColor: isDefaultTheme ? theme.chipBackground : theme.backgroundSoft,
                  },
                }}
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
              onRefresh={onRefresh}
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

