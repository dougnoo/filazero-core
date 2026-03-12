"use client";

import { Box, Typography, Button, Chip, Card, CardContent, CardHeader } from "@mui/material";
import { LocalHospital, Description, CheckCircle } from "@mui/icons-material";
import { theme } from "@/shared/theme";
import type { TriageResult } from "@/shared/types/chat";

interface TriageResultCardProps {
  result: TriageResult;
  onNewTriagem: () => void;
  onConnectDoctor: () => void;
  onDownload: () => void;
}

export function TriageResultCard({
  result,
  onNewTriagem,
  onConnectDoctor,
  onDownload,
}: TriageResultCardProps) {
  const colorByClass: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    VERDE: {
      bg: "#E8F5E9",
      border: "#4CAF50",
      text: "#2E7D32",
    },
    AMARELO: {
      bg: "#FFF9C4",
      border: "#FFC107",
      text: "#F57F17",
    },
    LARANJA: {
      bg: "#FFE0B2",
      border: "#FF9800",
      text: "#E65100",
    },
    VERMELHO: {
      bg: "#FFEBEE",
      border: "#F44336",
      text: "#C62828",
    },
    AZUL: {
      bg: "#E3F2FD",
      border: "#2196F3",
      text: "#1565C0",
    },
  };

  const colors =
    colorByClass[result.classificacao] ||
    colorByClass.AZUL;

  return (
    <Card
      sx={{
        border: `2px solid ${colors.border}`,
        bgcolor: colors.bg,
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle sx={{ color: colors.text, fontSize: 24 }} />
              <Typography sx={{ fontSize: "18px", fontWeight: 600, color: colors.text }}>
                Triagem Concluída
              </Typography>
            </Box>
            <Chip
              label={`Protocolo: ${result.protocolo || "—"}`}
              size="small"
              sx={{
                bgcolor: theme.white,
                color: colors.text,
                fontWeight: 600,
                fontSize: "12px",
              }}
            />
          </Box>
        }
        sx={{ pb: 1 }}
      />
      <CardContent>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: "12px", color: theme.textMuted }}>
              Classificação
            </Typography>
            <Typography sx={{ fontSize: "16px", fontWeight: 600, color: colors.text }}>
              {result.classificacao || "—"}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "12px", color: theme.textMuted }}>
              Status
            </Typography>
            <Typography sx={{ fontSize: "16px", fontWeight: 600, color: theme.textDark }}>
              {result.status || "AGUARDANDO_MEDICO"}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "12px", color: theme.textMuted }}>
              Tempo estimado
            </Typography>
            <Typography sx={{ fontSize: "16px", fontWeight: 600, color: theme.textDark }}>
              {result.tempo_espera_estimado || "—"}
            </Typography>
          </Box>
        </Box>

        {result.recomendacoes && result.recomendacoes.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: "12px", color: theme.textMuted, mb: 1 }}>
              Recomendações
            </Typography>
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              {result.recomendacoes.map((r, i) => (
                <Typography component="li" key={i} sx={{ fontSize: "14px", color: theme.textDark, mb: 0.5 }}>
                  {r}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {result.observacoes && (
          <Box sx={{ mb: 3, p: 2, bgcolor: theme.white, borderRadius: "8px" }}>
            <Typography sx={{ fontSize: "14px", color: theme.textDark }}>
              <strong>Observações:</strong> {result.observacoes}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, pt: 2 }}>
          <Button
            onClick={onConnectDoctor}
            variant="contained"
            startIcon={<LocalHospital sx={{ fontSize: 16 }} />}
            sx={{
              flex: 1,
              bgcolor: "#4CAF50",
              color: theme.white,
              fontSize: "14px",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 500,
              py: 1.5,
              "&:hover": { bgcolor: "#45A049" },
            }}
          >
            Conectar com Médico
          </Button>
          <Button
            onClick={onDownload}
            variant="outlined"
            startIcon={<Description sx={{ fontSize: 16 }} />}
            sx={{
              flex: 1,
              borderColor: colors.border,
              color: colors.text,
              fontSize: "14px",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 500,
              py: 1.5,
              "&:hover": {
                borderColor: colors.border,
                bgcolor: colors.bg,
              },
            }}
          >
            Baixar Resumo
          </Button>
          <Button
            onClick={onNewTriagem}
            variant="text"
            sx={{
              flex: 1,
              color: theme.textMuted,
              fontSize: "14px",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 500,
              py: 1.5,
              "&:hover": { bgcolor: "#F5F5F5" },
            }}
          >
            Nova Triagem
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

