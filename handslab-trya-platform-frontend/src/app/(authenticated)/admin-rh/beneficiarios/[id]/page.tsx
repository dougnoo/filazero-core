"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
} from "@mui/material";
import { beneficiaryService } from "../services/beneficiaryService";
import type { Beneficiary } from "../types/beneficiary";
import { useTheme } from "@/shared/hooks/useTheme";
import { BeneficiaryModal } from "../form-components";
import { tenantService } from "../services/tenantService";
import { healthOperatorService } from "../services/healthOperatorService";

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

// Ícone de editar - mesmo da tabela
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

export default function BeneficiaryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const id = params?.id as string;

  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [companies, setCompanies] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [healthOperators, setHealthOperators] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Carrega dados do beneficiário
  useEffect(() => {
    const loadBeneficiary = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await beneficiaryService.getById(id);
        setBeneficiary(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar dados do beneficiário"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBeneficiary();
  }, [id]);

  // Carrega empresas e operadoras
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tenants, operators] = await Promise.all([
          tenantService.listActive(),
          healthOperatorService.list(),
        ]);

        setCompanies(
          tenants.map((tenant) => ({
            id: tenant.id,
            name: tenant.name,
          }))
        );

        setHealthOperators(
          operators.map((operator) => ({
            id: operator.id,
            name: operator.name,
          }))
        );
      } catch (error) {
      }
    };

    loadData();
  }, []);

  const handleOpenEditModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (clearMessages = false) => {
    setIsModalOpen(false);
    if (clearMessages) {
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  };

  const handleSaveBeneficiary = async (data: Partial<Beneficiary>) => {
    if (!id || !beneficiary) return;

    try {
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

      await beneficiaryService.update(id, updateData);
      // Recarrega os dados do beneficiário
      const updated = await beneficiaryService.getById(id);
      setBeneficiary(updated);
      // Mostra toast de sucesso
      setSuccessMessage("Beneficiário atualizado com sucesso!");
      // Fecha o modal após um pequeno delay
      setTimeout(() => {
        handleCloseModal(false);
      }, 100);
    } catch (error: unknown) {
      let message = "Ocorreu um erro ao atualizar o beneficiário.";
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }
      setErrorMessage(message);
      throw error;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    // Se já está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (dateString.includes("-")) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("pt-BR");
  };

  const formatCPF = (cpf?: string) => {
    if (!cpf) return "-";
    // Remove formatação existente
    const cleanCpf = cpf.replace(/\D/g, "");
    // Formata se tiver 11 dígitos
    if (cleanCpf.length === 11) {
      return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return cpf;
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return "-";
    // Remove o +55 se existir
    const cleanPhone = phone.replace(/^\+55/, "");
    // Formata como (XX) XXXXX-XXXX
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };

  if (loading) {
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

  if (error || !beneficiary) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Beneficiário não encontrado"}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        {/* Card principal */}
        <Paper
          sx={{
            borderRadius: "12px",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 3,
              py: 2.5,
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() => router.back()}
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
              <Typography
                sx={{
                  fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: "24px",
                  color: theme?.colors.text.primary || "#041616",
                }}
              >
                {beneficiary.name}
              </Typography>
            </Box>
            <Chip
              label={beneficiary.active ? "Ativo" : "Inativo"}
              color={beneficiary.active ? "success" : "default"}
              sx={{
                fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                fontWeight: 600,
                ...(beneficiary.active && {
                  bgcolor: "#BCDF84",
                  color: theme?.colors.text.primary || "#041616",
                  "& .MuiChip-label": {
                    color: theme?.colors.text.primary || "#041616",
                  },
                }),
              }}
            />
          </Box>

          {/* Conteúdo */}
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  color: theme?.colors.text.primary || "#041616",
                }}
              >
                Dados gerais do beneficiário
              </Typography>
              <IconButton
                onClick={handleOpenEditModal}
                size="small"
                sx={{
                  color: theme?.colors.secondary || "#F15923",
                  "&:hover": {
                    bgcolor: "rgba(241, 89, 35, 0.08)",
                  },
                }}
              >
                <EditIcon />
              </IconButton>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 3,
              }}
            >
              {/* Coluna 1 */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "26px",
                      color: theme?.colors.text.secondary || "#041616",
                      mb: 0.5,
                    }}
                  >
                    Nome completo:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      color: theme?.colors.text.primary || "#041616",
                    }}
                  >
                    {beneficiary.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "26px",
                      color: theme?.colors.text.secondary || "#041616",
                      mb: 0.5,
                    }}
                  >
                    E-mail:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      color: theme?.colors.text.primary || "#041616",
                    }}
                  >
                    {beneficiary.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "26px",
                      color: theme?.colors.text.secondary || "#041616",
                      mb: 0.5,
                    }}
                  >
                    Operadora:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      color: theme?.colors.text.primary || "#041616",
                    }}
                  >
                    {beneficiary.operatorName || "-"}
                  </Typography>
                </Box>
              </Box>

              {/* Coluna 2 */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "26px",
                      color: theme?.colors.text.secondary || "#041616",
                      mb: 0.5,
                    }}
                  >
                    CPF:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      color: theme?.colors.text.primary || "#041616",
                    }}
                  >
                    {formatCPF(beneficiary.cpf)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "26px",
                      color: theme?.colors.text.secondary || "#041616",
                      mb: 0.5,
                    }}
                  >
                    Telefone:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      color: theme?.colors.text.primary || "#041616",
                    }}
                  >
                    {formatPhone(beneficiary.phone)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "26px",
                      color: theme?.colors.text.secondary || "#041616",
                      mb: 0.5,
                    }}
                  >
                    Plano de saúde:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      color: theme?.colors.text.primary || "#041616",
                    }}
                  >
                    {beneficiary.planName || "-"}
                  </Typography>
                </Box>
              </Box>

              {/* Coluna 3 */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "26px",
                      color: theme?.colors.text.secondary || "#041616",
                      mb: 0.5,
                    }}
                  >
                    Data de nascimento:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      color: theme?.colors.text.primary || "#041616",
                    }}
                  >
                    {formatDate(beneficiary.dateOfBirth)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "26px",
                      color: theme?.colors.text.secondary || "#041616",
                      mb: 0.5,
                    }}
                  >
                    Empresa vinculada:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      color: theme?.colors.text.primary || "#041616",
                    }}
                  >
                    {companies.find((c) => c.id === beneficiary.tenantId)
                      ?.name || "-"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Modal de edição */}
      <BeneficiaryModal
        open={isModalOpen}
        onClose={() => handleCloseModal(true)}
        onSubmit={handleSaveBeneficiary}
        beneficiary={beneficiary}
        mode="edit"
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
