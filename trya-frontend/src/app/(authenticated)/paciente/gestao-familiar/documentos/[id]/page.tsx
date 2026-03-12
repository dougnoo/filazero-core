"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { FilePreviewDialog } from "@/shared/components/FilePreviewDialog";
import { documentService } from "../services/documentService";
import type { DocumentDetail, DocumentStatus } from "../types/document.types";
import BackButton from "@/shared/components/BackButton";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { getUrlWithTenant } from "@/shared/utils/tenantUtils";
import { PatientCard } from "../../../components/PatientCard";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useTenantAssets();
  const documentId = params.id as string;

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchDocument = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await documentService.getById(documentId);
      setDocument(data);
    } catch (err) {
      console.error("Erro ao carregar documento:", err);
      setError("Erro ao carregar documento.");
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleDownload = async () => {
    if (!document) return;
    try {
      const result = await documentService.getDownloadUrl(document.id);
      window.open(result.downloadUrl, "_blank");
    } catch (err) {
      console.error("Erro ao baixar documento:", err);
      setSnackbar({
        open: true,
        message: "Erro ao gerar link de download.",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    try {
      setIsDeleting(true);
      await documentService.delete(document.id);
      setSnackbar({
        open: true,
        message: "Documento removido com sucesso!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      const url = getUrlWithTenant("/paciente/documentos", tenant);
      router.push(url);
    } catch (err) {
      console.error("Erro ao remover documento:", err);
      setSnackbar({
        open: true,
        message: "Erro ao remover documento.",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusChip = (status: DocumentStatus) => {
    const isValid = status === "VALID";
    return (
      <Chip
        label={isValid ? "Válido" : "Vencido"}
        size="small"
        sx={{
          bgcolor: isValid ? "#DCFCE7" : "#FEE2E2",
          color: isValid ? "#166534" : "#991B1B",
          fontWeight: 500,
          fontSize: "12px",
        }}
      />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !document) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">{error || "Documento não encontrado"}</Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => {
            const url = getUrlWithTenant("/paciente/documentos", tenant);
            router.push(url);
          }}
        >
          Voltar para documentos
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: { xs: 3, md: 3, lg: 4 },
        width: "100%",
        height: { xs: "auto", lg: "calc(100vh - 64px)" },
        minHeight: 0,
        maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: 320 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, md: 3 },
          height: { xs: "auto", lg: "calc(100vh - 64px)" },
          minHeight: 0,
          maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
          overflowY: { xs: "visible", lg: "auto" },
          overflowX: "hidden",
          pr: { lg: 1 },
          pb: { lg: 2 },
        }}
      >
        <BackButton />
        <PatientCard />
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: "16px" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {document.title}
              </Typography>
              {getStatusChip(document.status)}
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => setPreviewOpen(true)}
              >
                Visualizar
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Remover
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: "12px", color: "grey.600", mb: 0.5 }}
              >
                Membro associado
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {document.memberName}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{ fontSize: "12px", color: "grey.600", mb: 0.5 }}
              >
                Tipo de documento
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {document.documentTypeLabel}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{ fontSize: "12px", color: "grey.600", mb: 0.5 }}
              >
                Categoria
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {document.category}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{ fontSize: "12px", color: "grey.600", mb: 0.5 }}
              >
                Data de emissão
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {formatDate(document.issueDate)}
              </Typography>
            </Box>

            {document.validUntil && (
              <Box>
                <Typography
                  sx={{ fontSize: "12px", color: "grey.600", mb: 0.5 }}
                >
                  Data de validade
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {formatDate(document.validUntil)}
                </Typography>
              </Box>
            )}

            {document.notes && (
              <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                <Typography
                  sx={{ fontSize: "12px", color: "grey.600", mb: 0.5 }}
                >
                  Observações
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  {document.notes}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: "16px" }}>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>
            Informações do arquivo
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: "12px", color: "grey.600", mb: 0.5 }}
              >
                Nome do arquivo
              </Typography>
              <Typography sx={{ fontWeight: 500, wordBreak: "break-all" }}>
                {document.fileName}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{ fontSize: "12px", color: "grey.600", mb: 0.5 }}
              >
                Tamanho
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {formatFileSize(document.fileSize)}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{ fontSize: "12px", color: "grey.600", mb: 0.5 }}
              >
                Tipo
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {document.mimeType}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <FilePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={document.viewUrl}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Remover documento</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja remover este documento? Esta ação não pode ser
            desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                Removendo...
              </>
            ) : (
              "Remover"
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
