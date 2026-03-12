"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { formatFileSize } from "@/shared/utils";
import {
  ACCEPTED_FILE_EXTENSIONS,
  ACCEPTED_FILE_FORMATS_MAP,
} from "@/shared/constants/fileFormats";

interface FileUploadZoneProps {
  onFileSelect: (file: File | null) => void;
  acceptedFormats?: {
    mimeTypes: Record<string, string[]>;
    extensions: string[];
  };
  maxSize?: number;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
}

// Ícone de upload/cloud
const CloudUploadIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 25V46"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    />
    <path
      d="M15 32L22 25L29 32"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M41 27C42.3 26.3 43.4 25.3 44.2 24.1C45 22.9 45.5 21.5 45.7 20C45.9 18.5 45.8 17 45.5 15.5C45.2 14 44.6 12.6 43.7 11.4C42.8 10.2 41.7 9.2 40.4 8.5C39.1 7.8 37.7 7.4 36.2 7.3C34.7 7.2 33.2 7.4 31.8 7.9C30.4 8.4 29.1 9.2 28 10.2C27.1 7.3 25.3 4.8 22.9 3.1C20.5 1.4 17.6 0.7 14.7 1.1C11.8 1.5 9.2 2.9 7.3 5.1C5.4 7.3 4.3 10.1 4.3 13C4.3 15.7 5.2 18.3 6.9 20.4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    />
  </svg>
);

// Ícone de arquivo
const FileIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 2V9H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Ícone de fechar
const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function FileUploadZone({
  onFileSelect,
  acceptedFormats = {
    mimeTypes: ACCEPTED_FILE_FORMATS_MAP,
    extensions: [...ACCEPTED_FILE_EXTENSIONS],
  },
  maxSize = 10 * 1024 * 1024,
  disabled = false,
  title = "Selecione um arquivo ou solte aqui",
  subtitle = "JPG, PNG ou PDF, com até 10MB",
  buttonText = "Selecione o arquivo",
  selectedFile: externalSelectedFile,
  onRemoveFile,
}: FileUploadZoneProps) {
  const [internalSelectedFile, setInternalSelectedFile] = useState<File | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const selectedFile =
    externalSelectedFile !== undefined
      ? externalSelectedFile
      : internalSelectedFile;

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(
            `Arquivo muito grande. Tamanho máximo: ${formatFileSize(maxSize)}`
          );
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError(
            `Formato de arquivo inválido. Use apenas: ${acceptedFormats.extensions.join(
              ", "
            )}`
          );
        } else {
          setError("Erro ao processar arquivo");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (externalSelectedFile === undefined) {
          setInternalSelectedFile(file);
        }
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize, acceptedFormats.extensions, externalSelectedFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.mimeTypes,
    maxSize,
    multiple: false,
    disabled,
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (externalSelectedFile === undefined) {
      setInternalSelectedFile(null);
    }
    setError(null);
    if (onRemoveFile) {
      onRemoveFile();
    } else {
      onFileSelect(null);
    }
  };

  return (
    <Box>
      {!selectedFile ? (
        <Box
          {...getRootProps()}
          sx={{
            border: 2,
            borderStyle: "dashed",
            borderColor: error
              ? "error.main"
              : isDragActive
              ? "primary.main"
              : "divider",
            borderRadius: "12px",
            p: { xs: 3, md: 4 },
            textAlign: "center",
            cursor: disabled ? "not-allowed" : "pointer",
            bgcolor: isDragActive ? "action.hover" : "transparent",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: disabled ? "divider" : "primary.main",
              bgcolor: disabled ? "transparent" : "action.hover",
            },
          }}
        >
          <input {...getInputProps()} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                color: "grey.800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloudUploadIcon />
            </Box>

            <Typography
              sx={{
                color: error ? "error.main" : "black",
                fontWeight: 500,
                fontSize: { xs: "14px", md: "16px" },
              }}
            >
              {error || (isDragActive ? "Solte o arquivo aqui" : title)}
            </Typography>
            <Typography
              sx={{
                color: "grey.800",
                fontSize: { xs: "12px", md: "14px" },
              }}
            >
              {subtitle}
            </Typography>
            {buttonText && (
              <Button
                variant="contained"
                color="primary"
                disabled={disabled}
                onClick={() => {}}
              >
                {buttonText}
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: "12px",
            p: { xs: 2, md: 2.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "action.hover",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                color: "grey.800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileIcon />
            </Box>
            <Box>
              <Typography
                sx={{
                   
                  fontWeight: 600,
                  fontSize: { xs: "13px", md: "14px" },
                }}
              >
                {selectedFile.name}
              </Typography>
              <Typography
                sx={{
                  color: "grey.800",
                  fontSize: { xs: "12px", md: "13px" },
                }}
              >
                {formatFileSize(selectedFile.size)}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleRemoveFile}
            disabled={disabled}
            sx={{
              color: "grey.800",
              "&:hover": {
                bgcolor: "rgba(239, 68, 68, 0.1)",
                color: "error.main",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
