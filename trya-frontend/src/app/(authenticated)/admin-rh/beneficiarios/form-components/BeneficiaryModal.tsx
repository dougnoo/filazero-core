"use client";

import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Box,
  Link,
} from "@mui/material";
import BeneficiaryForm from "./BeneficiaryForm";
import FileUploadZone from "@/shared/components/FileUploadZone";
import type { Beneficiary, ImportResult } from "../types/beneficiary";
import { TEMPLATE_DOWNLOAD_URL } from "../services/beneficiaryService";

interface BeneficiaryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Beneficiary>) => Promise<void>;
  onImport?: (file: File) => Promise<ImportResult>;
  beneficiary?: Beneficiary | null;
  mode: "add" | "edit";
  companies?: Array<{ id: string; name: string }>;
  healthOperators?: Array<{ id: string; name: string }>;
}

// Ícone de fechar
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

export default function BeneficiaryModal({
  open,
  onClose,
  onSubmit,
  onImport,
  beneficiary,
  mode,
  companies = [],
  healthOperators = [],
}: BeneficiaryModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<Beneficiary> | null>(null);
  const [formIsValid, setFormIsValid] = useState(false);

  // Ref para armazenar os dados mais recentes do formulário
  const pendingFormDataRef = useRef<Partial<Beneficiary> | null>(null);

  // Reseta o estado quando o modal é aberto ou fechado
  useEffect(() => {
    // Reseta todos os estados quando o modal abre ou fecha
    setIsLoading(false);
    setSelectedFile(null);
    setFormData(null);
    setFormIsValid(false);
    pendingFormDataRef.current = null;
  }, [open]);

  // Reseta o loading quando o modal fecha
  const handleClose = () => {
    setIsLoading(false);
    pendingFormDataRef.current = null;
    onClose();
  };

  const handleSubmit = async (data: Partial<Beneficiary>) => {
    // Armazena os dados do formulário e dispara o envio imediatamente
    pendingFormDataRef.current = data;
    setFormData(data);
    setFormIsValid(true);
    
    // Executa o envio imediatamente após a validação bem-sucedida
    await executeSubmit(data);
  };

  const executeSubmit = async (data: Partial<Beneficiary>) => {
    try {
      setIsLoading(true);
      const promises: Promise<unknown>[] = [];

      // Se tem arquivo e está em modo add, faz upload
      if (selectedFile && onImport && mode === "add") {
        promises.push(onImport(selectedFile));
      }

      // Envia os dados do formulário apenas se houver dados preenchidos
      // ou se não houver arquivo (modo manual)
      const hasFormData = data.name || data.cpf || data.dateOfBirth || data.planId || data.tenantId;
      if (hasFormData || !selectedFile) {
        promises.push(onSubmit(data));
      }

      // Executa as ações
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      // Não fecha o modal aqui, deixa o componente pai fazer isso após mostrar o toast
      // O loading será resetado quando o modal fechar
    } catch (error) {
      // Sempre reseta o loading quando há erro
      setIsLoading(false);
      // Reseta os estados de validação para forçar nova validação no próximo envio
      setFormIsValid(false);
      pendingFormDataRef.current = null;
      // Re-lança o erro para que o componente pai possa tratá-lo
      throw error;
    }
  };

  const handleSaveClick = async () => {
    // Dispara a validação do formulário
    // O handleSubmit será chamado automaticamente se o form for válido
    const form = contentRef.current?.querySelector("form");
    if (form) {
      form.requestSubmit();
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            boxShadow: "0px 8px 24px rgba(6,36,36,0.12)",
            maxWidth: "600px",
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E5E7EB",
          px: 3,
          py: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "20px",
            }}
          >
            {mode === "add" ? "Importar beneficiários" : "Editar beneficiário"}
          </Typography>
          {mode === "add" && (
            <Typography
              sx={{
                fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                fontSize: "14px",
                color: "#6B7280",
                mt: 0.5,
              }}
            >
              Insira a planilha com dados dos beneficiários para inserção de
              dados em lote.
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            color: "#6B7280",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        ref={contentRef}
        sx={{
          px: 3,
          pt: "32px !important",
          pb: 3,
          position: "relative",
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255, 255, 255, 0.8)",
              zIndex: 1,
              borderRadius: "12px",
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}

        {/* Upload de arquivo - apenas em modo add */}
        {mode === "add" && (
          <>
            <Link
              href={TEMPLATE_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                fontSize: "14px",
                color: "grey.800",
                textDecoration: "underline",
                display: "block",
                mb: 2,
                textAlign: "center",
                cursor: "pointer",
                transition: "color 0.2s",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              Baixe aqui o template da planilha para importação
            </Link>

            <FileUploadZone
              onFileSelect={handleFileSelect}
              acceptedFormats={{
                mimeTypes: {
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    [".xlsx"],
                  "application/vnd.ms-excel": [".xls"],
                  "text/csv": [".csv"],
                },
                extensions: [".xlsx", ".xls", ".csv"],
              }}
              maxSize={10 * 1024 * 1024}
              disabled={isLoading}
              title="Selecione um arquivo ou arraste e solte aqui"
              subtitle="Arquivo .csv ou .xls"
              buttonText="Selecione o arquivo"
            />

            <Typography
              sx={{
                textAlign: "center",
                my: 3,
              }}
              color="grey.800"
              fontSize={14}
            >
              ou insira os dados manualmente
            </Typography>
          </>
        )}

        <BeneficiaryForm
          key={beneficiary?.id || "new"}
          beneficiary={beneficiary}
          onSubmit={handleSubmit}
          companies={companies}
          healthOperators={healthOperators}
          mode={mode}
          hasImportFile={!!selectedFile}
        />
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          borderTop: "1px solid #E5E7EB",
          px: 3,
          py: 2,
          gap: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
          color="error"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSaveClick}
          variant="contained"
          color="primary"
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={16} color="inherit" /> : null
          }
         
        >
          {isLoading
            ? "Salvando..."
            : mode === "add"
            ? "Salvar beneficiário"
            : "Atualizar beneficiário"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
