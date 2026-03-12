"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { ImportError } from "../types/beneficiary";

interface ImportErrorAlertProps {
  open: boolean;
  onClose: () => void;
  errors: ImportError[];
  totalErrors: number;
  successCount: number;
  totalRows: number;
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

// Ícone de alerta
const AlertIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="24" cy="24" r="20" fill="#FEF2F2" />
    <path
      d="M24 16V24M24 32H24.02"
      stroke="#DC2626"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ImportErrorAlert({
  open,
  onClose,
  errors,
  totalErrors,
  successCount,
  totalRows,
}: ImportErrorAlertProps) {
  const theme = useTheme();

  // Mostra no máximo 10 erros
  const displayErrors = errors.slice(0, 10);
  const hasMoreErrors = totalErrors > 10;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            boxShadow: "0px 8px 24px rgba(6,36,36,0.12)",
            maxWidth: "700px",
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid #E5E7EB",
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AlertIcon />
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "20px",
                color: "#DC2626",
              }}
            >
              Erros na Importação
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
                fontSize: "14px",
                color: "#6B7280",
                mt: 0.5,
              }}
            >
              {successCount > 0
                ? `${successCount} de ${totalRows} beneficiários importados com sucesso`
                : `Nenhum beneficiário foi importado`}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
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
        sx={{
          px: 3,
          py: 3,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              color: "#041616",
              mb: 1,
            }}
          >
            {totalErrors} erro(s) encontrado(s)
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
              fontSize: "14px",
              color: "#6B7280",
            }}
          >
            {hasMoreErrors
              ? `Mostrando os primeiros 10 erros de ${totalErrors}`
              : "Detalhes dos erros encontrados:"}
          </Typography>
        </Box>

        <List
          sx={{
            bgcolor: "#F8F9FA",
            borderRadius: "8px",
            maxHeight: "400px",
            overflow: "auto",
            p: 0,
          }}
        >
          {displayErrors.map((error, index) => (
            <Box key={index}>
              <ListItem
                sx={{
                  py: 2,
                  px: 2,
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "#DC2626",
                      color: "white",
                      borderRadius: "4px",
                      px: 1,
                      py: 0.5,
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                    }}
                  >
                    Linha {error.row}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-chivo), Inter, system-ui, sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#DC2626",
                      flex: 1,
                    }}
                  >
                    {error.error}
                  </Typography>
                </Box>
                {error.data && (
                  <Box
                    sx={{
                      bgcolor: "white",
                      borderRadius: "6px",
                      p: 1.5,
                      width: "100%",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily:
                          "var(--font-chivo), Inter, system-ui, sans-serif",
                        fontSize: "12px",
                        color: "#6B7280",
                        mb: 0.5,
                      }}
                    >
                      Dados da linha:
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 1,
                      }}
                    >
                      {Object.entries(error.data)
                        .slice(0, 6)
                        .map(([key, value]) => (
                          <Box key={key}>
                            <Typography
                              sx={{
                                fontFamily:
                                  "var(--font-chivo), Inter, system-ui, sans-serif",
                                fontSize: "11px",
                                color: "#9CA3AF",
                                fontWeight: 600,
                              }}
                            >
                              {key}:
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily:
                                  "var(--font-chivo), Inter, system-ui, sans-serif",
                                fontSize: "12px",
                                color: "#041616",
                                wordBreak: "break-word",
                              }}
                            >
                              {String(value)}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  </Box>
                )}
              </ListItem>
              {index < displayErrors.length - 1 && <Divider />}
            </Box>
          ))}
        </List>

        {hasMoreErrors && (
          <Typography
            sx={{
              fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
              fontSize: "14px",
              color: "#6B7280",
              textAlign: "center",
              mt: 2,
              fontStyle: "italic",
            }}
          >
            + {totalErrors - 10} erros adicionais não exibidos
          </Typography>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          borderTop: "1px solid #E5E7EB",
          px: 3,
          py: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            height: 40,
            borderRadius: "8px",
            textTransform: "none",
            fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
            fontWeight: 600,
            px: 3,
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
