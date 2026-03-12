"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

// Constante de cor conforme design.md - verde escuro
const BUTTON_COLOR = "#0A3A3A";

interface SearchMedicalServiceButtonProps {
  content: string;
  specialty?: string;
  timestamp: string;
}

/**
 * SearchMedicalServiceButton - Componente de busca de médico na rede
 * 
 * Exibe um botão "Buscar médico na rede" com estilo verde escuro (#0A3A3A).
 * Quando a especialidade está disponível, exibe a especialidade recomendada.
 * Ao clicar, redireciona para a busca de médicos com a especialidade pré-filtrada.
 * 
 * O avatar é gerenciado pela composição do chat, não pelo componente.
 * 
 * @requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */
export function SearchMedicalServiceButton({
  content,
  specialty,
  timestamp,
}: SearchMedicalServiceButtonProps) {
  const router = useRouter();

  const handleSearch = () => {
    if (specialty) {
      router.push(`/paciente/rede-credenciada?search=${encodeURIComponent(specialty)}`);
    } else {
      router.push("/paciente/rede-credenciada");
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: { xs: "10px", md: "12px" },
        p: { xs: 1.5, md: 2 },
        border: "1px solid",
        borderColor: "divider",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      {/* Conteúdo da mensagem */}
      <Typography
        sx={{
          fontSize: { xs: "13px", md: "14px" },
          fontWeight: 400,
          lineHeight: { xs: "18px", md: "20px" },
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          mb: 2,
        }}
      >
        {content}
      </Typography>

      {/* Especialidade recomendada (quando disponível) */}
      {specialty && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            p: { xs: 1, md: 1.5 },
            bgcolor: "rgba(10, 58, 58, 0.08)",
            borderRadius: { xs: "6px", md: "8px" },
            border: `1px solid ${BUTTON_COLOR}20`,
          }}
        >
          <LocalHospitalIcon
            sx={{
              color: BUTTON_COLOR,
              fontSize: { xs: 18, md: 20 },
              flexShrink: 0,
            }}
          />
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "11px", md: "12px" },
                fontWeight: 500,
                color: "grey.600",
                lineHeight: 1.2,
              }}
            >
              Especialidade recomendada
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "13px", md: "14px" },
                fontWeight: 600,
                color: BUTTON_COLOR,
                lineHeight: 1.3,
              }}
            >
              {specialty}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Botão de busca */}
      <Button
        onClick={handleSearch}
        variant="contained"
        startIcon={<SearchIcon />}
        aria-label={specialty ? `Buscar médico na rede - ${specialty}` : "Buscar médico na rede"}
        fullWidth
      >
        Buscar médico na rede
      </Button>

      {/* Timestamp */}
      {timestamp && (
        <Typography
          sx={{
            fontSize: { xs: "9px", md: "10px" },
            fontWeight: 400,
            color: "grey.600",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            justifyContent: "flex-end",
            mt: { xs: 1, md: 1.5 },
          }}
        >
          {timestamp} ✓✓
        </Typography>
      )}
    </Box>
  );
}
