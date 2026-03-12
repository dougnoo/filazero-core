"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useToast } from "@/shared/context/ToastContext";
import { termsService } from "@/shared/services/termsService";

// Componente do ícone de fechar
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

export default function PrivacyAcceptancePage() {
  const router = useRouter();
  const theme = useTheme();
  const { showError } = useToast();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [clinicalSharingAccepted, setClinicalSharingAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const loadPrivacyPolicyUrl = async () => {
    if (pdfUrl) return;
    setIsLoadingPdf(true);
    try {
      const term = await termsService.getTermByType("PRIVACY_POLICY");
      if (term) {
        setPdfUrl(term.s3Url);
      }
    } catch (error) {
      showError("Erro ao carregar política de privacidade");
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleViewPrivacyPolicy = () => {
    setIsPdfModalOpen(true);
    void loadPrivacyPolicyUrl();
  };

  // Componente SVG de Escudo
  const ShieldIcon = () => (
    <svg 
      width="140" 
      height="140" 
      viewBox="0 0 140 140" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M79.2 132.1L73.3 134.4C71.1723 135.198 68.8277 135.198 66.7 134.4L60.8 132.1C45.8558 126.241 33.0196 116.022 23.96 102.772C14.9003 89.5211 10.0363 73.8516 10 57.8V30C21.3249 31.614 32.8755 30.1437 43.435 25.7439C53.9944 21.3442 63.1717 14.1779 70 5C82.5 23.2 103.2 31.8 130 30V57.8C129.964 73.8516 125.1 89.5211 116.04 102.772C106.98 116.022 94.1442 126.241 79.2 132.1V132.1Z" 
        stroke={theme.palette.secondary.main}
        strokeWidth="6.58823" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  const handleAcceptAndContinue = () => {
    if (privacyAccepted && clinicalSharingAccepted) {
      setIsSubmitting(true);
      router.push("/paciente/onboarding/triagem-intro");
    }
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
  };

  const isFormValid = privacyAccepted && clinicalSharingAccepted;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'background.default',
        px: { xs: 2, sm: 3 },
        py: 4,
        gap: 3,
      }}
    >
      {/* Ícone de Escudo com Background Circular */}
      <Box
        sx={{
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          backgroundColor: 'primary.main',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ShieldIcon />
      </Box>

      {/* Título */}
      <Typography
        sx={{
          fontSize: { xs: "24px", sm: "28px", md: "32px" },
          fontWeight: 700,
          color: 'grey.800',
          lineHeight: 1.2,
          textAlign: "center",
          maxWidth: "576px",
        }}
      >
        Precisamos da sua autorização para continuar
      </Typography>

      {/* Checkboxes */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          maxWidth: "576px",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}

            />
          }
          label={
            <Typography
              sx={{
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 400,
                color: 'grey.800',
                lineHeight: 1.6,
              }}
            >
              Autorizo o uso dos meus dados conforme a{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewPrivacyPolicy();
                }}
              >
                Política de Privacidade
              </Box>{" "}
              e{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewPrivacyPolicy();
                }}
              >
                Termos de uso.
              </Box>{" "}
            </Typography>
          }
          sx={{
            alignItems: "flex-start",
            "& .MuiFormControlLabel-label": {
              marginLeft: 1,
            },
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={clinicalSharingAccepted}
              onChange={(e) => setClinicalSharingAccepted(e.target.checked)}
            />
          }
          label={
            <Typography
              sx={{
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 400,
                color: 'grey.800',
                lineHeight: 1.6,
              }}
            >
              Concordo com o compartilhamento de informações clínicas para fins
              de cuidado médico.
            </Typography>
          }
          sx={{
            alignItems: "flex-start",
            "& .MuiFormControlLabel-label": {
              marginLeft: 1,
            },
          }}
        />
      </Box>

      {/* Botões */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          width: "100%",
          maxWidth: "576px",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleViewPrivacyPolicy}
          sx={{
            flex: 1,
            height: { xs: "48px", sm: "52px" },
           
          }}
        >
          Ver política de privacidade
        </Button>

        <Button
          variant="contained"
          onClick={handleAcceptAndContinue}
          disabled={!isFormValid || isSubmitting}
          sx={{
            flex: 1,
            height: { xs: "48px", sm: "52px" },
          }}
        >
          {isSubmitting ? "Processando..." : "Aceitar e continuar"}
        </Button>
      </Box>

      {/* Modal do PDF */}
      <Dialog
        open={isPdfModalOpen}
        onClose={handleClosePdfModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
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
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "20px",
              color: 'grey.800',
            }}
          >
            Política de Privacidade
          </Typography>
          <IconButton
            onClick={handleClosePdfModal}
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
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: "70vh",
          }}
        >
          {isLoadingPdf ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "70vh",
              }}
            >
              <CircularProgress />
            </Box>
          ) : pdfUrl ? (
            <Box
              component="iframe"
              src={pdfUrl}
              sx={{
                width: "100%",
                height: "100%",
                minHeight: "70vh",
                border: "none",
                flex: 1,
              }}
              title="Política de Privacidade"
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "70vh",
                px: 3,
              }}
            >
              <Typography color="text.secondary">
                Política de privacidade não disponível. Entre em contato com o
                administrador.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

