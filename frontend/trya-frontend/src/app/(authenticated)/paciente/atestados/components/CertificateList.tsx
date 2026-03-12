"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getUrlWithTenant, identifyTenant } from "@/shared/utils/tenantUtils";
import type {
  Certificate,
  PaginatedCertificates,
} from "../types/certificate.types";
import {
  getCertificateStatusConfig,
  CertificateStatus,
} from "../types/certificate.types";

interface CertificateListProps {
  certificates: Certificate[];
  pagination: PaginatedCertificates | null;
  currentPage: number;
  onPageChange: (page: number) => void;
}

// Ícone de documento
const DocumentIcon = ({ color }: { color: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2V8H20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function CertificateList({
  certificates,
  pagination,
  currentPage,
  onPageChange,
}: CertificateListProps) {
  const theme = useTheme();
  const { tenant: tenantName } = identifyTenant();
  const router = useRouter();

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
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <Box>
      {/* Lista de Atestados */}
      <Box>
        {certificates.map((certificate, index) => {          
          const formattedDate = formatDate(certificate.createdAt);

          return (
            <Box
              key={certificate.id}
              sx={{
                display: "flex",
                alignItems: "center",
                px: { xs: 2, md: 3 },
                py: 2.5,
                borderBottom:
                  index < certificates.length - 1
                    ? "1px dashed #E5E7EB"
                    : "none",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => {
                const urlWithTenant = getUrlWithTenant(
                  `/paciente/atestados/${certificate.id}`,
                  tenantName
                );
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
                    backgroundColor: 'primary.light',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <DocumentIcon
                    color={theme.palette.primary.main}
                  />
                </Box>

                {/* Data e Nome */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                      fontSize: { xs: "13px", md: "14px" },
                    }}
                  >
                    {formattedDate}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'grey.800',
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

              {/* Coluna Seta */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ArrowRightIcon />
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
            px: { xs: 2, md: 3 },
            py: 3,
            borderTop: "1px solid #E5E7EB",
          }}
        >
          <Typography
            sx={{
              color: 'grey.800',
              fontSize: { xs: "12px", md: "14px" },
            }}
          >
            Itens por página: {pagination.limit}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{
                color: 'grey.800',
                fontSize: { xs: "12px", md: "14px" },
              }}
            >
              {currentPage} de {pagination.totalPages}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                size="small"
                disabled={currentPage === 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onPageChange(currentPage - 1);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  border: "1px solid #E5E7EB",
                  borderRadius: "50%",
                  "&:disabled": {
                    opacity: 0.5,
                  },
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
              <IconButton
                size="small"
                disabled={currentPage === pagination.totalPages}
                onClick={(e) => {
                  e.stopPropagation();
                  onPageChange(currentPage + 1);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: "50%",
                  "&:hover": {
                    bgcolor: 'primary.main',
                    opacity: 0.9,
                  },
                  "&:disabled": {
                    opacity: 0.5,
                    bgcolor: "#E5E7EB",
                  },
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
