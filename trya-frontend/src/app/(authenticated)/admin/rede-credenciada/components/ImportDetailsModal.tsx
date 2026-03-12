"use client";

import { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { DownloadIcon, RefreshIcon } from "@/shared/components/icons";
import type { ImportStatus } from "@/shared/constants/importStatus";

interface ImportRecordDetails {
  id: string;
  date: string;
  operatorName: string;
  userName: string;
  status: ImportStatus;
  errorMessage?: string;
  file?: File;
}

interface ImportDetailsModalProps {
  open: boolean;
  onClose: () => void;
  selectedImport: ImportRecordDetails | null;
  onDownload: (importRecord: ImportRecordDetails) => void;
  onReprocess: (importRecord: ImportRecordDetails) => void;
  renderStatusChip: (status: ImportStatus) => ReactNode;
}

export function ImportDetailsModal({
  open,
  onClose,
  selectedImport,
  onDownload,
  onReprocess,
  renderStatusChip,
}: ImportDetailsModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Detalhes da Importação</DialogTitle>
      <DialogContent>
        {selectedImport && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Data
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedImport.date}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Operadora
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedImport.operatorName}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Usuário
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedImport.userName}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>{renderStatusChip(selectedImport.status)}</Box>
            </Box>
            {selectedImport.status === "failed" && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  A importação falhou.
                </Typography>
                {selectedImport.errorMessage && (
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily: "inherit",
                      fontSize: "0.875rem",
                      mt: 1,
                      mb: 1,
                    }}
                  >
                    {selectedImport.errorMessage}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Clique em &quot;Reprocessar&quot; para tentar novamente.
                  {selectedImport.id && !selectedImport.id.startsWith("temp-")
                    ? " O arquivo salvo no S3 será usado automaticamente."
                    : selectedImport.file
                      ? " O mesmo arquivo será usado."
                      : " Você precisará fazer upload novamente."}
                </Typography>
              </Alert>
            )}
            {selectedImport.status === "completed" && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Importação concluída com sucesso. A rede credenciada está
                disponível para os beneficiários.
              </Alert>
            )}
            {selectedImport.status === "processing" && (
              <Alert severity="info" sx={{ mt: 2 }}>
                A importação está em andamento. Aguarde a conclusão.
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            fontWeight: 600,
            borderColor: "divider",
          }}
        >
          Fechar
        </Button>
        {selectedImport?.id && !selectedImport.id.startsWith("temp-") && (
          <Button
            onClick={() => onDownload(selectedImport)}
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              fontWeight: 600,
              borderColor: "divider",
            }}
          >
            Baixar arquivo
          </Button>
        )}
        {selectedImport && (
          <Button
            onClick={() => onReprocess(selectedImport)}
            variant="contained"
            startIcon={<RefreshIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              fontWeight: 600,
            }}
          >
            Reprocessar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
