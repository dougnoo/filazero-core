"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useGlobalThemeContext } from "@/shared/context/GlobalThemeContext";
import type { ClientTheme } from "@/shared/types/theme";

export default function PersonalizacaoPage() {
  const theme = useThemeColors();
  const { theme: themeData } = useGlobalThemeContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado local para edição do tema
  const [formData, setFormData] = useState<Partial<ClientTheme>>({
    colors: {
      primary: themeData?.colors?.primary || "#0A3A3A",
      secondary: themeData?.colors?.secondary || "#E4B4C6",
      background: themeData?.colors?.background || "#FFFFFF",
      backgroundSecondary: themeData?.colors?.backgroundSecondary || "#F8F5F0",
      surface: themeData?.colors?.surface || "#F5F5F5",
      button: {
        primary: themeData?.colors?.button?.primary || "#FAB900",
        primaryHover: themeData?.colors?.button?.primaryHover || "#E5A800",
        text: themeData?.colors?.button?.text || "#2F3237",
      },
      border: {
        default: themeData?.colors?.border?.default || "#D1D5DB",
        hover: themeData?.colors?.border?.hover || "#9CA3AF",
        focus: themeData?.colors?.border?.focus || "#0A3A3A",
      },
      text: {
        primary: themeData?.colors?.text?.primary || "#041616",
        secondary: themeData?.colors?.text?.secondary || "#4A6060",
        disabled: themeData?.colors?.text?.disabled || "#9CA3AF",
      },
    },
    typography: {
      fontFamily: themeData?.typography?.fontFamily || "Inter, system-ui, sans-serif",
      heading: {
        fontSize: themeData?.typography?.heading?.fontSize || "2rem",
        fontWeight: themeData?.typography?.heading?.fontWeight || 700,
      },
      body: {
        fontSize: themeData?.typography?.body?.fontSize || "1rem",
        fontWeight: themeData?.typography?.body?.fontWeight || 400,
      },
      caption: {
        fontSize: themeData?.typography?.caption?.fontSize || "0.875rem",
        fontWeight: themeData?.typography?.caption?.fontWeight || 400,
      },
    },
  });

  useEffect(() => {
    if (themeData) {
      setFormData({
        colors: {
          primary: themeData.colors?.primary || "#0A3A3A",
          secondary: themeData.colors?.secondary || "#E4B4C6",
          background: themeData.colors?.background || "#FFFFFF",
          backgroundSecondary: themeData.colors?.backgroundSecondary || "#F8F5F0",
          surface: themeData.colors?.surface || "#F5F5F5",
          button: {
            primary: themeData.colors?.button?.primary || "#FAB900",
            primaryHover: themeData.colors?.button?.primaryHover || "#E5A800",
            text: themeData.colors?.button?.text || "#2F3237",
          },
          border: {
            default: themeData.colors?.border?.default || "#D1D5DB",
            hover: themeData.colors?.border?.hover || "#9CA3AF",
            focus: themeData.colors?.border?.focus || "#0A3A3A",
          },
          text: {
            primary: themeData.colors?.text?.primary || "#041616",
            secondary: themeData.colors?.text?.secondary || "#4A6060",
            disabled: themeData.colors?.text?.disabled || "#9CA3AF",
          },
        },
        typography: {
          fontFamily: themeData.typography?.fontFamily || "Inter, system-ui, sans-serif",
          heading: {
            fontSize: themeData.typography?.heading?.fontSize || "2rem",
            fontWeight: themeData.typography?.heading?.fontWeight || 700,
          },
          body: {
            fontSize: themeData.typography?.body?.fontSize || "1rem",
            fontWeight: themeData.typography?.body?.fontWeight || 400,
          },
          caption: {
            fontSize: themeData.typography?.caption?.fontSize || "0.875rem",
            fontWeight: themeData.typography?.caption?.fontWeight || 400,
          },
        },
      });
    }
  }, [themeData]);

  const handleInputChange = (path: string, value: string | number) => {
    const keys = path.split(".");
    setFormData((prev) => {
      const newData = { ...prev };
      let current: Record<string, unknown> = newData as Record<string, unknown>;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Aqui você pode adicionar a lógica para salvar o tema no backend
      // Por enquanto, apenas simula o salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erro ao salvar personalização. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (themeData) {
      setFormData({
        colors: {
          primary: themeData.colors?.primary || "#0A3A3A",
          secondary: themeData.colors?.secondary || "#E4B4C6",
          background: themeData.colors?.background || "#FFFFFF",
          backgroundSecondary: themeData.colors?.backgroundSecondary || "#F8F5F0",
          surface: themeData.colors?.surface || "#F5F5F5",
          button: {
            primary: themeData.colors?.button?.primary || "#FAB900",
            primaryHover: themeData.colors?.button?.primaryHover || "#E5A800",
            text: themeData.colors?.button?.text || "#2F3237",
          },
          border: {
            default: themeData.colors?.border?.default || "#D1D5DB",
            hover: themeData.colors?.border?.hover || "#9CA3AF",
            focus: themeData.colors?.border?.focus || "#0A3A3A",
          },
          text: {
            primary: themeData.colors?.text?.primary || "#041616",
            secondary: themeData.colors?.text?.secondary || "#4A6060",
            disabled: themeData.colors?.text?.disabled || "#9CA3AF",
          },
        },
        typography: {
          fontFamily: themeData.typography?.fontFamily || "Inter, system-ui, sans-serif",
          heading: {
            fontSize: themeData.typography?.heading?.fontSize || "2rem",
            fontWeight: themeData.typography?.heading?.fontWeight || 700,
          },
          body: {
            fontSize: themeData.typography?.body?.fontSize || "1rem",
            fontWeight: themeData.typography?.body?.fontWeight || 400,
          },
          caption: {
            fontSize: themeData.typography?.caption?.fontSize || "0.875rem",
            fontWeight: themeData.typography?.caption?.fontWeight || 400,
          },
        },
      });
    }
  };

  return (
    <Box component="main" sx={{ pb: { xs: 6, md: 8 }, px: { xs: 2, md: 4 }, py: { xs: 2, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          backgroundColor: theme.backgroundSoft,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 3,
            color: theme.textDark,
            fontWeight: 700,
            fontFamily: theme.fontFamily,
          }}
        >
          Personalização de Tema
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: theme.textMuted,
            fontFamily: theme.fontFamily,
          }}
        >
          Gerencie cores, fundos e elementos visuais para adaptar o ambiente às suas preferências.
        </Typography>

        {/* Cores Primárias */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: theme.textDark,
              fontWeight: 600,
              fontFamily: theme.fontFamily,
            }}
          >
            Cores Primárias
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Cor Primária"
                type="color"
                value={formData.colors?.primary || "#0A3A3A"}
                onChange={(e) => handleInputChange("colors.primary", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Cor Secundária"
                type="color"
                value={formData.colors?.secondary || "#E4B4C6"}
                onChange={(e) => handleInputChange("colors.secondary", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Fundo Principal"
                type="color"
                value={formData.colors?.background || "#FFFFFF"}
                onChange={(e) => handleInputChange("colors.background", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Fundo Secundário"
                type="color"
                value={formData.colors?.backgroundSecondary || "#F8F5F0"}
                onChange={(e) => handleInputChange("colors.backgroundSecondary", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Cores de Botões */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: theme.textDark,
              fontWeight: 600,
              fontFamily: theme.fontFamily,
            }}
          >
            Cores de Botões
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
              <TextField
                fullWidth
                label="Cor do Botão Primário"
                type="color"
                value={formData.colors?.button?.primary || "#FAB900"}
                onChange={(e) => handleInputChange("colors.button.primary", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
              <TextField
                fullWidth
                label="Cor do Hover"
                type="color"
                value={formData.colors?.button?.primaryHover || "#E5A800"}
                onChange={(e) => handleInputChange("colors.button.primaryHover", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
              <TextField
                fullWidth
                label="Cor do Texto do Botão"
                type="color"
                value={formData.colors?.button?.text || "#2F3237"}
                onChange={(e) => handleInputChange("colors.button.text", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Cores de Texto */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: theme.textDark,
              fontWeight: 600,
              fontFamily: theme.fontFamily,
            }}
          >
            Cores de Texto
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Texto Principal"
                type="color"
                value={formData.colors?.text?.primary || "#041616"}
                onChange={(e) => handleInputChange("colors.text.primary", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Texto Secundário"
                type="color"
                value={formData.colors?.text?.secondary || "#4A6060"}
                onChange={(e) => handleInputChange("colors.text.secondary", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Cores de Bordas */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: theme.textDark,
              fontWeight: 600,
              fontFamily: theme.fontFamily,
            }}
          >
            Cores de Bordas
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
              <TextField
                fullWidth
                label="Borda Padrão"
                type="color"
                value={formData.colors?.border?.default || "#D1D5DB"}
                onChange={(e) => handleInputChange("colors.border.default", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
              <TextField
                fullWidth
                label="Borda Hover"
                type="color"
                value={formData.colors?.border?.hover || "#9CA3AF"}
                onChange={(e) => handleInputChange("colors.border.hover", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
              <TextField
                fullWidth
                label="Borda Focus"
                type="color"
                value={formData.colors?.border?.focus || "#0A3A3A"}
                onChange={(e) => handleInputChange("colors.border.focus", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Tipografia */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: theme.textDark,
              fontWeight: 600,
              fontFamily: theme.fontFamily,
            }}
          >
            Tipografia
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Família da Fonte"
                value={formData.typography?.fontFamily || "Inter, system-ui, sans-serif"}
                onChange={(e) => handleInputChange("typography.fontFamily", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(25% - 18px)' } }}>
              <TextField
                fullWidth
                label="Tamanho do Título"
                value={formData.typography?.heading?.fontSize || "2rem"}
                onChange={(e) => handleInputChange("typography.heading.fontSize", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(25% - 18px)' } }}>
              <TextField
                fullWidth
                label="Peso do Título"
                type="number"
                value={formData.typography?.heading?.fontWeight || 700}
                onChange={(e) => handleInputChange("typography.heading.fontWeight", parseInt(e.target.value))}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Tamanho do Corpo"
                value={formData.typography?.body?.fontSize || "1rem"}
                onChange={(e) => handleInputChange("typography.body.fontSize", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Peso do Corpo"
                type="number"
                value={formData.typography?.body?.fontWeight || 400}
                onChange={(e) => handleInputChange("typography.body.fontWeight", parseInt(e.target.value))}
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Botões de Ação */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{
              borderColor: theme.primary,
              color: theme.primary,
              "&:hover": {
                borderColor: theme.primary,
                backgroundColor: theme.backgroundSoft,
              },
            }}
          >
            Restaurar Padrão
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{
              backgroundColor: theme.primary,
              color: theme.textDark,
              "&:hover": {
                backgroundColor: theme.primary,
                opacity: 0.9,
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Salvar Personalização"}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar de sucesso */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: "100%" }}>
          Personalização salva com sucesso!
        </Alert>
      </Snackbar>

      {/* Snackbar de erro */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

