"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { useTheme } from "@/shared/hooks/useTheme";

const PRIVACY_ACCEPTANCE_KEY = "paciente_privacy_acceptance_completed";

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
  const { theme, currentTheme } = useTheme();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [clinicalSharingAccepted, setClinicalSharingAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const primaryColor = theme?.colors?.primary || "#F4B840";
  const secondaryColor = theme?.colors?.secondary || "#041616";
  const backgroundColor = theme?.colors?.background || "#FFFFFF";
  const fontFamily = theme?.typography?.fontFamily || "Inter, sans-serif";

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
        stroke={secondaryColor}
        strokeWidth="6.58823" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  // URL do PDF dinâmica baseada no tenant atual
  const pdfUrl = `https://broker-${currentTheme}.s3.amazonaws.com/public/terms/privacy_policy/2.pdf`;

  useEffect(() => {
    // Verifica se já completou o aceite
    const hasCompleted = localStorage.getItem(PRIVACY_ACCEPTANCE_KEY);
    if (hasCompleted === "true") {
      router.push("/paciente/onboarding/triagem-intro");
    }
  }, [router]);

  const handleAcceptAndContinue = () => {
    if (privacyAccepted && clinicalSharingAccepted) {
      setIsSubmitting(true);
      localStorage.setItem("paciente_privacy_accepted", "true");
      localStorage.setItem("paciente_clinical_sharing_accepted", "true");
      localStorage.setItem(PRIVACY_ACCEPTANCE_KEY, "true");
      
      // Redireciona para o próximo passo (triagem intro)
      router.push("/paciente/onboarding/triagem-intro");
    }
  };

  const handleViewPrivacyPolicy = () => {
    setIsPdfModalOpen(true);
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
        backgroundColor: backgroundColor,
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
          backgroundColor: primaryColor,
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
          color: secondaryColor,
          fontFamily: fontFamily,
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
              sx={{
                color: secondaryColor,
                "&.Mui-checked": {
                  color: primaryColor,
                },
              }}
            />
          }
          label={
            <Typography
              sx={{
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 400,
                color: secondaryColor,
                fontFamily: fontFamily,
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
              sx={{
                color: secondaryColor,
                "&.Mui-checked": {
                  color: primaryColor,
                },
              }}
            />
          }
          label={
            <Typography
              sx={{
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 400,
                color: secondaryColor,
                fontFamily: fontFamily,
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
            backgroundColor: "#FFFFFF",
            color: secondaryColor,
            fontFamily: fontFamily,
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "8px",
            border: `2px solid ${primaryColor}`,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#FFFFFF",
              border: `2px solid ${primaryColor}`,
              opacity: 0.9,
              boxShadow: "none",
            },
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
            backgroundColor: primaryColor,
            color: secondaryColor,
            fontFamily: fontFamily,
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: primaryColor,
              opacity: 0.9,
              boxShadow: "none",
            },
            "&:disabled": {
              backgroundColor: primaryColor,
              color: secondaryColor,
              opacity: 0.5,
            },
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
              fontFamily: fontFamily,
              fontWeight: 700,
              fontSize: "20px",
              color: secondaryColor,
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
        </DialogContent>
      </Dialog>
    </Box>
  );
}

