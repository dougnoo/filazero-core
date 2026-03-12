"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Chip, IconButton, Menu, MenuItem } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useTheme } from "@/shared/hooks/useTheme";
import { getUrlWithTenant } from "@/shared/utils/tenantUtils";
import type { Certificate, PaginatedCertificates } from "../types/certificate.types";
import { getCertificateStatusConfig, CertificateStatus } from "../types/certificate.types";

interface CertificateListProps {
  certificates: Certificate[];
  pagination: PaginatedCertificates | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

// Ícone de mais opções
const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
);

// Ícone de documento
const DocumentIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function CertificateList({
  certificates,
  pagination,
  currentPage,
  onPageChange,
  onRefresh,
}: CertificateListProps) {
  const theme = useThemeColors();
  const { theme: currentTheme, currentTheme: tenantName } = useTheme();
  const isDefaultTheme = currentTheme?.id === 'default';
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, certificate: Certificate) => {
    setAnchorEl(event.currentTarget);
    setSelectedCertificate(certificate);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCertificate(null);
  };

  const getStatusConfig = (status: Certificate["status"]) => {
    const config = getCertificateStatusConfig(status as CertificateStatus);
    return {
      label: config.label,
      backgroundColor: config.bgcolor,
      color: config.color,
    };
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
      // Se não tiver data, retorna data atual como fallback
      return new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Se a data for inválida, retorna data atual como fallback
        return new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      // Em caso de erro, retorna data atual como fallback
      return new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  const getFileNameWithoutExtension = (fileName: string) => {
    return fileName.replace(/\.[^/.]+$/, "");
  };

  // Ícone de seta para direita
  const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <Box
      sx={{
        bgcolor: theme.cardBackground,
        borderRadius: "8px",
        border: `1px solid ${theme.softBorder}`,
        overflow: "hidden",
      }}
    >
      {/* Cabeçalho da Tabela */}
      <Box
        sx={{
          display: "flex",
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: `1px solid ${theme.softBorder}`,
          bgcolor: isDefaultTheme ? theme.chipBackground : theme.backgroundSoft,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: { xs: "13px", md: "14px" },
              fontWeight: 600,
              color: theme.textMuted,
            }}
          >
            Atestado
          </Typography>
        </Box>
        <Box sx={{ width: { xs: 120, md: 150 } }}>
          <Typography
            sx={{
              fontSize: { xs: "13px", md: "14px" },
              fontWeight: 600,
              color: theme.textMuted,
            }}
          >
            Status
          </Typography>
        </Box>
      </Box>

      {/* Lista de Atestados */}
      <Box>
        {certificates.map((certificate, index) => {
          const statusConfig = getStatusConfig(certificate.status);
          const formattedDate = formatDate(certificate.createdAt);

          return (
            <Box
              key={certificate.id}
              sx={{
                display: "flex",
                alignItems: "center",
                px: { xs: 2, md: 3 },
                py: 2.5,
                borderBottom: index < certificates.length - 1 ? `1px dashed ${theme.softBorder}` : "none",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: isDefaultTheme ? theme.chipBackground : theme.backgroundSoft,
                },
              }}
              onClick={() => {
                const urlWithTenant = getUrlWithTenant(`/paciente/atestados/${certificate.id}`, tenantName);
                router.push(urlWithTenant);
              }}
            >
              {/* Coluna Atestado */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {/* Ícone */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    backgroundColor: isDefaultTheme ? theme.secondary : theme.iconBackground,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <DocumentIcon color={isDefaultTheme ? theme.white : theme.primary} />
                </Box>

                {/* Data e Nome */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: theme.textDark,
                      fontWeight: 500,
                      fontSize: { xs: "13px", md: "14px" },
                      mb: 0.5,
                    }}
                  >
                    {formattedDate}
                  </Typography>
                  <Typography
                    sx={{
                      color: theme.textMuted,
                      fontSize: { xs: "12px", md: "13px" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getFileNameWithoutExtension(certificate.fileName)}
                  </Typography>
                </Box>
              </Box>

              {/* Coluna Status */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: { xs: 120, md: 150 },
                  justifyContent: "flex-end",
                }}
              >
                <Chip
                  label={statusConfig.label}
                  sx={{
                    backgroundColor: statusConfig.backgroundColor,
                    color: statusConfig.color,
                    fontWeight: 500,
                    fontSize: { xs: "11px", md: "12px" },
                    height: { xs: 24, md: 28 },
                    borderRadius: "6px",
                    "& .MuiChip-label": {
                      px: { xs: 1.5, md: 2 },
                    },
                  }}
                />
                <Box
                  sx={{
                    color: theme.textMuted,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ArrowRightIcon />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            px: 2,
          }}
        >
          <Typography
            sx={{
              color: theme.textMuted,
              fontSize: "0.875rem",
            }}
          >
            {`${(currentPage - 1) * pagination.limit + 1}-${Math.min(currentPage * pagination.limit, pagination.total)} de ${pagination.total}`}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              sx={{
                border: `1px solid ${theme.softBorder}`,
                borderRadius: "6px",
                color: theme.textDark,
                "&:disabled": {
                  opacity: 0.5,
                },
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
            <IconButton
              size="small"
              disabled={currentPage === pagination.totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              sx={{
                border: `1px solid ${theme.softBorder}`,
                borderRadius: "6px",
                color: theme.textDark,
                "&:disabled": {
                  opacity: 0.5,
                },
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Menu de Opções */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => {
          if (selectedCertificate) {
            window.open(selectedCertificate.fileUrl, "_blank");
          }
          handleMenuClose();
        }}>
          Ver atestado
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Implementar exclusão
          handleMenuClose();
        }}>
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
}

