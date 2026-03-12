"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Link,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BackButton from "@/shared/components/BackButton";
import FileUploadZone from "@/shared/components/FileUploadZone";
import { claimsImportService } from "../services/claimsImportService";
import { ACCEPTED_MIME_TYPES } from "@/shared/constants/fileFormats";

export default function SinistrosUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await claimsImportService.importClaims(file);
      router.push("/admin/sinistros");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar planilha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
      <BackButton variant="icon-only" onClick={() => router.push("/admin/sinistros")} />
      <Stack spacing={3}>
        {/* Page header */}
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Importar sinistros
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Envie uma planilha de sinistros para que esses dados sejam considerados no processo de seleção da rede credenciada.
          </Typography>
        </Box>

        {/* Card */}
        <Card
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              {/* Section header */}
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Upload
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Envie uma planilha Excel (.xlsx) seguindo o template oficial.
                </Typography>
              </Box>

              {/* Info box */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  bgcolor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: 1.5,
                  p: 2,
                }}
              >
                <InfoOutlinedIcon sx={{ color: "#3B82F6", fontSize: 20, mt: 0.1, flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    Contexto da importação
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Os sinistros importados são utilizados como base histórica para apoiar a seleção e recomendação da rede credenciada. Esta importação não altera dados cadastrais nem informações de beneficiários.
                  </Typography>
                </Box>
              </Box>

              {/* Template download link */}
              <Box sx={{ textAlign: "center" }}>
                <Link
                  href={`${process.env.NEXT_PUBLIC_ASSETS_CDN_URL || ""}/templates/sinistros-template.xlsx`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "text.secondary",
                    textDecoration: "underline",
                    fontSize: 14,
                    cursor: "pointer",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  Baixe aqui o template da planilha para importação
                </Link>
              </Box>

              {/* Upload zone */}
              <FileUploadZone
                onFileSelect={setFile}
                selectedFile={file}
                onRemoveFile={() => setFile(null)}
                acceptedFormats={{
                  mimeTypes: {
                    "text/csv": [".csv"],
                    "application/vnd.ms-excel": [".xls"],
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                  },
                  extensions: [".csv", ".xls", ".xlsx"],
                }}
                title="Selecione um arquivo ou arraste e solte aqui"
                subtitle="Arquivo .csv ou .xls"
                buttonText="Selecione o arquivo"
                disabled={loading}
              />

              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.push("/admin/sinistros")}
            disabled={loading}
            sx={{ px: 3, py: 1.25, textTransform: "none", fontWeight: 500, borderRadius: 1 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!file || loading}
            onClick={handleConfirm}
            sx={{
              px: 3,
              py: 1.25,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1,
              bgcolor: "#0F4C4C",
              "&:hover": { bgcolor: "#0A3A3A" },
            }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {loading ? "Enviando..." : "Processar importação"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
