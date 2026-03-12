"use client";

import { useState, useRef } from "react";
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
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { useTheme } from "@/shared/hooks/useTheme";
import { certificateService } from "../services/certificateService";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 8L12 3L7 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 3V15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FileIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
  const theme = useThemeColors();
  const { theme: currentTheme } = useTheme();
  const isDefaultTheme = currentTheme?.id === 'default';
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Formato de arquivo não suportado. Use JPG, PNG ou PDF.");
      return;
    }

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Arquivo muito grande. O tamanho máximo é 10MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    try {
      setIsUploading(true);
      setError(null);
      await certificateService.upload({
        file: selectedFile,
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
      setSelectedFile(null);
      setError(null);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
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
          bgcolor: theme.cardBackground,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          p: 0,
          fontFamily: theme.fontFamily,
        },
      }}
    >
      <Box sx={{ position: "relative", p: { xs: 3, md: 4 } }}>
        {/* Botão Fechar */}
        <IconButton
          onClick={handleClose}
          disabled={isUploading}
          sx={{
            position: "absolute",
            top: { xs: 16, md: 20 },
            right: { xs: 16, md: 20 },
            color: theme.textMuted,
            "&:hover": {
              bgcolor: theme.backgroundSoft,
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Título */}
        <Typography
          sx={{
            color: theme.textDark,
            fontWeight: 600,
            fontSize: { xs: "18px", md: "20px" },
            mb: 1,
          }}
        >
          Enviar atestado médico
        </Typography>
        <Typography
          sx={{
            color: theme.textMuted,
            fontSize: { xs: "13px", md: "14px" },
            mb: 3,
          }}
        >
          Faça o upload do documento em formato PDF ou imagem para que a plataforma realize a validação automática.
        </Typography>

        {/* Erro */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{
              mb: 3,
              borderRadius: "8px",
              fontFamily: theme.fontFamily,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Campo Título do Atestado */}
        <TextField
          fullWidth
          label="Título do atestado"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: theme.white,
              "& fieldset": {
                borderColor: theme.softBorder,
              },
              "&:hover fieldset": {
                borderColor: theme.primary,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.primary,
              },
            },
            "& .MuiInputLabel-root": {
              color: theme.textMuted,
              "&.Mui-focused": {
                color: theme.primary,
              },
            },
            "& .MuiInputBase-input": {
              color: theme.textDark,
              fontSize: { xs: "14px", md: "15px" },
            },
          }}
        />

        {/* Área de Upload */}
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            border: `2px dashed ${isDragging ? theme.primary : theme.softBorder}`,
            borderRadius: "12px",
            p: { xs: 4, md: 5 },
            textAlign: "center",
            transition: "all 0.2s",
            backgroundColor: isDragging ? theme.backgroundSoft : "transparent",
          }}
        >
          {/* Ícone e Texto */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 3, md: 4 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  color: theme.textMuted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UploadIcon />
              </Box>

              <Box sx={{ textAlign: "left" }}>
                <Typography
                  sx={{
                    color: theme.textDark,
                    fontWeight: 600,
                    fontSize: { xs: "16px", md: "18px" },
                    mb: 0.5,
                  }}
                >
                  Selecione um arquivo ou solte aqui
                </Typography>
                <Typography
                  sx={{
                    color: theme.textMuted,
                    fontSize: { xs: "13px", md: "14px" },
                  }}
                >
                  JPG, PNG ou PDF, com até 10MB
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              sx={{
                bgcolor: isDefaultTheme ? theme.secondary : theme.textDark,
                color: theme.white,
                textTransform: "none",
                fontWeight: 500,
                fontSize: { xs: "14px", md: "15px" },
                px: { xs: 3, md: 4 },
                py: 1.5,
                borderRadius: "8px",
                boxShadow: "none",
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: isDefaultTheme ? theme.secondary : theme.textDark,
                  opacity: 0.9,
                  boxShadow: "none",
                },
              }}
            >
              Selecione o arquivo
            </Button>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileInputChange}
            style={{ display: "none" }}
          />
        </Box>

        {/* Preview do Arquivo Selecionado */}
        {selectedFile && (
          <Box
            sx={{
              mt: 3,
              border: `1px solid ${theme.softBorder}`,
              borderRadius: "12px",
              p: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: theme.white,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "8px",
                backgroundColor: isDefaultTheme ? theme.chipBackground : theme.iconBackground,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: theme.textDark,
              }}
            >
              <FileIcon />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Typography
                  sx={{
                    color: theme.textDark,
                    fontWeight: 500,
                    fontSize: { xs: "14px", md: "15px" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {selectedFile.name.replace(/\.[^/.]+$/, "")}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    color: theme.primary,
                    fontSize: { xs: "13px", md: "14px" },
                    fontWeight: 500,
                    cursor: "pointer",
                    textDecoration: "underline",
                    flexShrink: 0,
                  }}
                  onClick={() => {
                    const url = URL.createObjectURL(selectedFile);
                    window.open(url, "_blank");
                  }}
                >
                  Visualizar
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: theme.textMuted,
                  fontSize: { xs: "12px", md: "13px" },
                }}
              >
                {formatFileSize(selectedFile.size)}
              </Typography>
            </Box>

            <IconButton
              onClick={handleRemoveFile}
              disabled={isUploading}
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "#EF4444",
                color: theme.white,
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "#DC2626",
                },
                "&:disabled": {
                  opacity: 0.5,
                  cursor: "not-allowed",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {/* Botões de Ação */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isUploading}
            sx={{
              color: theme.textMuted,
              textTransform: "none",
              fontWeight: 500,
              fontSize: { xs: "14px", md: "15px" },
              px: { xs: 3, md: 4 },
              py: 1.5,
              borderRadius: "8px",
              border: `1px solid ${theme.softBorder}`,
              "&:hover": {
                backgroundColor: theme.backgroundSoft,
                borderColor: theme.textMuted,
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !title.trim() || isUploading}
            variant="contained"
            sx={{
              backgroundColor: isDefaultTheme ? theme.secondary : theme.primary,
              color: theme.white,
              textTransform: "none",
              fontWeight: 500,
              fontSize: { xs: "14px", md: "15px" },
              px: { xs: 3, md: 4 },
              py: 1.5,
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: isDefaultTheme ? theme.secondary : theme.primary,
                opacity: 0.9,
                boxShadow: "none",
              },
              "&:disabled": {
                backgroundColor: theme.softBorder,
                color: theme.textMuted,
              },
            }}
          >
            {isUploading ? (
              <>
                <CircularProgress size={20} sx={{ color: theme.white, mr: 1 }} />
                Enviando...
              </>
            ) : (
              "Continuar"
            )}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

