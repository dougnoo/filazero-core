"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatFileSize } from "@/shared/utils";
import { ACCEPTED_FILE_FORMATS_MAP } from "@/shared/constants/fileFormats";

interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}

export function FileUploadZone({
  file,
  onFileSelect,
  loading = false,
  disabled = false,
  error,
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_FORMATS_MAP,
    maxFiles: 1,
    disabled: disabled || loading,
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        variant="outlined"
        sx={{
          p: 4,
          textAlign: "center",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          borderStyle: "dashed",
          borderWidth: 2,
          borderColor: error
            ? "error.main"
            : isDragActive
              ? "primary.main"
              : "divider",
          backgroundColor: isDragActive ? "action.hover" : "background.paper",
          opacity: disabled ? 0.5 : 1,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: disabled ? undefined : "action.hover",
            borderColor: disabled ? undefined : "primary.main",
          },
        }}
      >
        <input {...getInputProps()} />

        {loading ? (
          <Box sx={{ py: 2 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Processando arquivo...
            </Typography>
          </Box>
        ) : file ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <InsertDriveFileIcon color="primary" sx={{ fontSize: 40 }} />
            <Box sx={{ textAlign: "left" }}>
              <Typography variant="body1" fontWeight={500}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(file.size)}
              </Typography>
            </Box>
            <IconButton
              onClick={handleRemoveFile}
              size="small"
              color="error"
              disabled={disabled}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon color="action" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              {isDragActive
                ? "Solte o arquivo aqui..."
                : "Arraste e solte um arquivo Excel ou CSV"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ou clique para selecionar (máx. 10MB)
            </Typography>
          </Box>
        )}
      </Paper>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
