"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { termsService } from "@/shared/services/termsService";
import { DocumentModal } from "@/shared/components/DocumentModal";
import { PatientCard } from "../components/PatientCard";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function TermosPrivacidadePage() {
  const router = useRouter();

  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsUrl, setTermsUrl] = useState("");
  const [privacyUrl, setPrivacyUrl] = useState("");
  const [isLoadingTermsUrl, setIsLoadingTermsUrl] = useState(false);
  const [isLoadingPrivacyUrl, setIsLoadingPrivacyUrl] = useState(false);

  const loadTermsUrl = async () => {
    if (termsUrl) return;

    setIsLoadingTermsUrl(true);
    try {
      const term = await termsService.getTermByType("TERMS_OF_USE");
      if (term) {
        setTermsUrl(term.s3Url);
      }
    } catch (error) {
      console.error("Erro ao carregar termos:", error);
    } finally {
      setIsLoadingTermsUrl(false);
    }
  };

  const loadPrivacyUrl = async () => {
    if (privacyUrl) return;

    setIsLoadingPrivacyUrl(true);
    try {
      const term = await termsService.getTermByType("PRIVACY_POLICY");
      if (term) {
        setPrivacyUrl(term.s3Url);
      }
    } catch (error) {
      console.error("Erro ao carregar política de privacidade:", error);
    } finally {
      setIsLoadingPrivacyUrl(false);
    }
  };

  const handleOpenTermsModal = async () => {
    setTermsModalOpen(true);
    await loadTermsUrl();
  };

  const handleOpenPrivacyModal = async () => {
    setPrivacyModalOpen(true);
    await loadPrivacyUrl();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: { xs: 3, md: 3, lg: 4 },
        width: "100%",
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Sidebar com PatientCard */}
      <Box
        sx={{
          width: { xs: "100%", lg: 320 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, md: 3 },
          order: { xs: 2, lg: 1 },
        }}
      >
        <PatientCard />
      </Box>

      {/* Conteúdo Principal */}
      <Box
        sx={{
          flex: 1,
          order: { xs: 1, lg: 2 },
        }}
      >
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: "8px",
            p: { xs: 3, sm: 4 },
          }}
        >
          {/* Botão Voltar */}
          <Box
            onClick={() => router.back()}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 3,
              cursor: "pointer",
              width: "fit-content",
              "&:hover": {
                opacity: 0.7,
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20,   }} />
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                
              }}
            >
              Voltar
            </Typography>
          </Box>

          {/* Título */}
          <Typography
            sx={{
              fontSize: { xs: "24px", sm: "28px", md: "32px" },
              fontWeight: 700,
              
              mb: 2,
            }}
          >
            Termos e Privacidade
          </Typography>

          {/* Descrição */}
          <Typography
            sx={{
              fontSize: { xs: "14px", sm: "16px" },
              color: "grey.800",
              
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Privacidade é parte do nosso cuidado com a saúde!
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "13px", sm: "14px" },
              color: "grey.800",
              
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            Na Trya, a proteção de dados é uma prioridade. Desta forma, contamos
            com a implementação de um Programa de Governança de Privacidade que
            orienta nossas atividades, constituído por procedimentos e políticas
            internas de segurança da informação, bem como disponibilizamos no
            nosso site, Aviso de Privacidade e o canal de atendimento aos
            Titulares, em conformidade com a legislação.
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "13px", sm: "14px" },
              color: "grey.800",
              
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Como uma plataforma de saúde que integra diferentes atores do
            ecossistema, adotamos práticas contínuas de proteção de dados e
            segurança da informação — porque confiança também é cuidado.
          </Typography>

          {/* Lista de itens */}
          <List
            sx={{
              p: 0,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleOpenTermsModal}
                sx={{
                  py: 2,
                  px: 3,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: { xs: "15px", sm: "16px" },
                        fontWeight: 600,
                      }}
                    >
                      Termos de Uso
                    </Typography>
                  }
                  secondary={
                    <Typography
                      sx={{
                        fontSize: { xs: "13px", sm: "14px" },
                        color: "grey.800",
                        mt: 0.5,
                      }}
                    >
                      Regras e condições de uso da plataforma.
                    </Typography>
                  }
                />
                <ChevronRightIcon sx={{ color: "grey.800" }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={handleOpenPrivacyModal}
                sx={{
                  py: 2,
                  px: 3,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: { xs: "15px", sm: "16px" },
                        fontWeight: 600,
                      }}
                    >
                      Política de Privacidade
                    </Typography>
                  }
                  secondary={
                    <Typography
                      sx={{
                        fontSize: { xs: "13px", sm: "14px" },
                        color: "grey.800",
                        mt: 0.5,
                      }}
                    >
                      Como seus dados pessoais são tratados.
                    </Typography>
                  }
                />
                <ChevronRightIcon sx={{ color: "grey.800" }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Box>

      {/* Modais */}
      <DocumentModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        documentUrl={termsUrl}
        title="Termos de Uso"
        isLoading={isLoadingTermsUrl}
      />

      <DocumentModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        documentUrl={privacyUrl}
        title="Política de Privacidade"
        isLoading={isLoadingPrivacyUrl}
      />
    </Box>
  );
}
