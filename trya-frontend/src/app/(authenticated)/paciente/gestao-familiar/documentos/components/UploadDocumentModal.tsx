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
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { documentService } from "../services/documentService";
import FileUploadZone from "@/shared/components/FileUploadZone";
import type {
  FamilyMember,
  DocumentCatalogEntry,
  MedicalDocumentType,
} from "../types/document.types";

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  members: FamilyMember[];
  catalog: DocumentCatalogEntry[];
  preSelectedMemberId?: string;
}

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
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

export function UploadDocumentModal({
  open,
  onClose,
  onSuccess,
  members,
  catalog,
  preSelectedMemberId,
}: UploadDocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [memberId, setMemberId] = useState("");
  const [documentType, setDocumentType] = useState<MedicalDocumentType | "">("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [issueDate, setIssueDate] = useState<Dayjs | null>(null);
  const [validUntil, setValidUntil] = useState<Dayjs | null>(null);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories =
    documentType
      ? catalog.find((c) => c.type === documentType)?.categories || []
      : [];

  useEffect(() => {
    if (open && preSelectedMemberId) {
      setMemberId(preSelectedMemberId);
    }
  }, [open, preSelectedMemberId]);

  useEffect(() => {
    if (selectedFile && !title) {
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(fileNameWithoutExt);
    }
  }, [selectedFile, title]);

  useEffect(() => {
    setCategory("");
  }, [documentType]);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setError(null);
  };

  const isFormValid =
    selectedFile &&
    memberId &&
    documentType &&
    category &&
    title.trim() &&
    issueDate;

  const handleUpload = async () => {
    if (!isFormValid || !issueDate) return;

    try {
      setIsUploading(true);
      setError(null);
      await documentService.upload({
        file: selectedFile,
        memberUserId: memberId,
        documentType: documentType as MedicalDocumentType,
        category,
        title: title.trim(),
        issueDate: issueDate.format("YYYY-MM-DD"),
        validUntil: validUntil ? validUntil.format("YYYY-MM-DD") : undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      setError("Erro ao enviar documento. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setMemberId(preSelectedMemberId || "");
      setDocumentType("");
      setCategory("");
      setTitle("");
      setIssueDate(null);
      setValidUntil(null);
      setNotes("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          bgcolor: "background.paper",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          p: 0,
          maxHeight: "95vh",
        },
      }}
    >
      <Box sx={{ position: "relative", p: { xs: 3, md: 4 }, overflowY: "auto" }}>
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
          Adicionar documento
        </Typography>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 3, borderRadius: "8px" }}
          >
            {error}
          </Alert>
        )}

        <Box
          sx={{
            mt: 1,
            display: "grid",
            gap: 2,
          }}
        >
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            placeholder="Ex: Exame de Sangue - Janeiro 2026"
          />

          <TextField
            select
            label="Tipo de documento"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as MedicalDocumentType)}
            required
            fullWidth
          >
            {catalog.map((c) => (
              <MenuItem key={c.type} value={c.type}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            fullWidth
            disabled={!documentType}
          >
            {availableCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <DatePicker
            label="Data de emissão"
            value={issueDate}
            onChange={(newValue) => setIssueDate(newValue)}
            slotProps={{
              textField: {
                required: true,
                fullWidth: true,
                helperText: "Para exames ou vacinas, inserir a data de realização.",
              },
            }}
          />
          <DatePicker
            label="Data de validade (opcional)"
            value={validUntil}
            onChange={(newValue) => setValidUntil(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
              },
              field: { clearable: true },
            }}
          />

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
        </Box>

        <Box sx={{ mt: 2 }}>
          <TextField
            label="Observações (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="Informações adicionais sobre o documento..."
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>
            Membro associado ao documento
          </Typography>
          <TextField
            select
            label="Membro"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
            fullWidth
          >
            {members.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name} ({m.type})
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button onClick={handleClose} disabled={isUploading} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!isFormValid || isUploading}
            variant="contained"
            color="primary"
          >
            {isUploading ? (
              <>
                <CircularProgress
                  size={18}
                  sx={{ color: "primary.contrastText", mr: 1 }}
                />
                Enviando...
              </>
            ) : (
              "Salvar documento"
            )}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
