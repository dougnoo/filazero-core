"use client";

import { Box, Typography, Avatar, Collapse, IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  usePatientData,
} from "@/shared/hooks/usePatientData";
import { buildAssetUrl } from "@/shared/theme/createTenantTheme";
import { useCollapsibleOnMobile } from "@/shared/hooks/useCollapsibleOnMobile";

export function PatientCard() {
  const { expanded, handleToggle, isContentVisible } = useCollapsibleOnMobile();

  const { data: patientData, isLoading, hasError } = usePatientData();

  // Função para formatar CPF
  const formatCPF = (cpf?: string) => {
    if (!cpf) return "";
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Função para formatar telefone
  const formatPhone = (phone?: string) => {
    if (!phone) return "";
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, "");

    // Se começar com 55 (código do Brasil), remove
    let phoneNumber = cleaned;
    if (cleaned.startsWith("55") && cleaned.length > 10) {
      phoneNumber = cleaned.substring(2);
    }

    // Formata baseado no tamanho
    if (phoneNumber.length === 11) {
      // Celular: (XX) XXXXX-XXXX
      return phoneNumber.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (phoneNumber.length === 10) {
      // Fixo: (XX) XXXX-XXXX
      return phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    // Se não conseguir formatar, retorna o original
    return phone;
  };

  // Função para formatar data de nascimento baseada no idioma do navegador
  const formatBirthDate = (date?: string) => {
    if (!date) return "";
    try {
      // Parse da data diretamente da string para evitar problemas de timezone
      // Formato esperado: YYYY-MM-DD
      const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!dateMatch) {
        // Se não estiver no formato esperado, tenta usar Date
        const d = new Date(date);
        const day = String(d.getUTCDate()).padStart(2, "0");
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const year = d.getUTCFullYear();

        // Detecta se o idioma é português
        const isPortuguese =
          typeof navigator !== "undefined" &&
          (navigator.language?.toLowerCase().includes("pt") ||
            navigator.languages?.some((lang) =>
              lang.toLowerCase().includes("pt")
            ));

        if (isPortuguese) {
          return `${day}/${month}/${year}`;
        }
        return `${year}-${month}-${day}`;
      }

      const [, year, month, day] = dateMatch;

      // Detecta se o idioma é português
      const isPortuguese =
        typeof navigator !== "undefined" &&
        (navigator.language?.toLowerCase().includes("pt") ||
          navigator.languages?.some((lang) =>
            lang.toLowerCase().includes("pt")
          ));

      // Se for português, usa formato brasileiro DD/MM/YYYY
      if (isPortuguese) {
        return `${day}/${month}/${year}`;
      }
      // Para outros idiomas (incluindo inglês), usa formato YYYY-MM-DD
      return `${year}-${month}-${day}`;
    } catch {
      return date;
    }
  };

  // Função para formatar data de validade do plano (MM/YYYY)
  const formatActiveUntil = (date?: string | null) => {
    if (!date) return null;
    try {
      const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const [, year, month] = dateMatch;
        return `${month}/${year}`;
      }
      const d = new Date(date);
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const year = d.getUTCFullYear();
      return `${month}/${year}`;
    } catch {
      return null;
    }
  };

  // Função para capitalizar nome
  const capitalizeName = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Função para obter iniciais do nome da operadora
  const getOperatorInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const activePlan = patientData?.activePlan;
  const activeUntilFormatted = formatActiveUntil(activePlan?.activeUntil);

  const patientInfo = [
    ["Nome:", capitalizeName(patientData?.name) || "-"],
    ["CPF:", formatCPF(patientData?.cpf) || "-"],
    [
      "Carteirinha:",
      activePlan?.cardNumber,
    ],
    ["Nascimento:", formatBirthDate(patientData?.birthDate) || "-"],
    ["Telefone:", formatPhone(patientData?.phone) || "-"],
  ];
  return (
    <Box
      id="tour-patient-card"
      sx={{
        width: "100%",
        bgcolor: "#FFFFFF",
        borderRadius: { xs: "16px", md: "8px" },
        border: { xs: `1px solid`, md: "none" },
        borderColor: { xs: 'divider', md: 'transparent' },
        p: { xs: 2, md: "24px" },
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* --- Plano ativo --- */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: expanded ? 2 : 0 }}>
        {/* Header - Clickable on mobile */}
        <Box
          onClick={handleToggle}
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            alignItems: "center",
            cursor: { xs: "pointer", lg: "default" },
          }}
        >
          <Avatar
            src={activePlan?.operatorName?.toLowerCase().includes("amil") ? buildAssetUrl('public/operadoras/amil.png') : undefined}
            sx={{
              width: { xs: 56, md: 84 },
              height: { xs: 56, md: 84 },
              bgcolor: 'secondary.light',
              fontSize: { xs: "18px", md: "24px" },
              fontWeight: 600,
              "& img": {
                width: { xs: 42, md: 64 },
                height: { xs: 42, md: 64 },
                objectFit: "contain",
              },
            }}
          >
            {getOperatorInitials(activePlan?.operatorName)}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: "15px", md: "16px" },
                fontWeight: 600,
                lineHeight: "20px",
              }}
            >
              {activePlan?.operatorName || "-"}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "13px", md: "14px" },
                color: 'grey.800',
                lineHeight: "20px",
              }}
            >
              {activePlan?.planName || "-"}
            </Typography>
          </Box>

          {/* Chevron icon - only on mobile */}
          <Box sx={{ display: { xs: "flex", lg: "none" } }}>
            <IconButton
              size="small"
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            >
              <KeyboardArrowDownIcon sx={{ color: "grey.600" }} />
            </IconButton>
          </Box>
        </Box>

        {/* Collapsible content on mobile, always visible on desktop */}
      <Collapse in={isContentVisible} timeout="auto">
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Status */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                bgcolor: '#E8F5E9',
                borderRadius: { xs: "10px", md: "8px" },
                py: { xs: "10px", md: "8px" },
                px: { xs: "12px", md: "16px" },
                width: "100%",
              }}
            >
              <Box
                sx={{
                  width: { xs: 9, md: 8 },
                  height: { xs: 9, md: 8 },
                  bgcolor: '#4CAF50',
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: "13px", md: "14px" },
                  fontWeight: 500,
                  lineHeight: "20px",
                }}
              >
                {activeUntilFormatted ? `Ativo até ${activeUntilFormatted}` : "Plano ativo"}
              </Typography>
            </Box>

            {/* Descriptions */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {isLoading ? (
                <Typography
                  sx={{
                    color: 'gray.800',
                    fontSize: "13px",
                    textAlign: "center",
                    py: 2,
                  }}
                >
                  Carregando dados...
                </Typography>
              ) : hasError ? (
                <Typography
                  sx={{
                    color: 'gray.800',
                    fontSize: "13px",
                    textAlign: "center",
                    py: 2,
                  }}
                >
                  Erro ao carregar dados
                </Typography>
              ) : (
                patientInfo.map(([label, value], i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "13px", md: "12px" },
                        color: 'gray.800',
                        lineHeight: "20px",
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "13px", md: "14px" },
                        fontWeight: 500,
                        lineHeight: "20px",
                        textAlign: { xs: "right", md: "left" },
                        wordBreak: { xs: "break-word", md: "normal" },
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
