"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { certificateService } from "../services/certificateService";
import FileUploadZone from "@/shared/components/FileUploadZone";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [observation, setObservation] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile && !title) {
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(fileNameWithoutExt);
    }
  }, [selectedFile, title]);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    try {
      setIsUploading(true);
      setError(null);
      await certificateService.upload({
        file: selectedFile,
        observations: observation.trim() || undefined,
        title: title.trim(),
      });
      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      setError("Erro ao enviar atestado. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setTitle("");
      setObservation("");
      setSelectedFile(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: 'background.paper',
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          p: 0,
        },
      }}
    >
      <Box sx={{ position: "relative", p: { xs: 3, md: 4 } }}>
        <IconButton
          onClick={handleClose}
          disabled={isUploading}
          sx={{
            position: "absolute",
            top: { xs: 16, md: 20 },
            right: { xs: 16, md: 20 },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          sx={{
            fontWeight: 600,
            fontSize: { xs: "18px", md: "20px" },
            mb: 1,
          }}
        >
          Enviar atestado médico
        </Typography>
        <Typography
          sx={{
            color: 'grey.800',
            fontSize: { xs: "13px", md: "14px" },
            mb: 3,
          }}
        >
          Faça o upload do documento em formato PDF ou imagem para que a plataforma realize a validação automática.
        </Typography>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{
              mb: 3,
              borderRadius: "8px",
            }}
          >
            {error}
          </Alert>
        )}

        <FileUploadZone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onRemoveFile={() => setSelectedFile(null)}
          acceptedFormats={{
            mimeTypes: {
              "image/jpeg": [".jpg", ".jpeg"],
              "image/png": [".png"],
              "application/pdf": [".pdf"],
            },
            extensions: [".jpg", ".jpeg", ".png", ".pdf"],
          }}
          maxSize={10 * 1024 * 1024}
          disabled={isUploading}
          title="Selecione um arquivo ou solte aqui"
          subtitle="JPG, PNG ou PDF, com até 10MB"
        />

        {selectedFile && (
          <Box sx={{ mt: 3 }}>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: { xs: "13px", md: "14px" },
                mb: 1.5,
              }}
            >
              Título do atestado
            </Typography>
            <TextField
              fullWidth
              placeholder="Digite o título..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}     
            />
          </Box>
        )}

        {selectedFile && (
          <Box sx={{ mt: 3 }}>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: { xs: "13px", md: "14px" },
                mb: 1.5,
              }}
            >
              Adicionar observação (opcional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Digite aqui..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              
            />
          </Box>
        )}

        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isUploading}
            variant="outlined"
            color="error"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !title.trim() || isUploading}
            variant="contained"
            color="primary"
            
          >
            {isUploading ? (
              <>
                <CircularProgress size={18} sx={{ color: 'primary.contrastText', mr: 1 }} />
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
