"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { usePlatformAuth } from "@/shared/hooks/usePlatformAuth";
import { platformAuthService } from "@/shared/services/platformAuthService";
import { useToast } from "@/shared/hooks/useToast";
import ProfilePictureUpload from "@/shared/components/ProfilePictureUpload";

export default function PerfilPage() {
  const router = useRouter();
  const theme = useThemeColors();
  const { user, refreshUser } = usePlatformAuth();
  const { showError, showSuccess, showInfo } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [crm, setCrm] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user) {
          setNome(user.name || "");
          setEmail(user.email || "");
          setTelefone(user.phone || "");
          setCrm(user.crm || "");
          setEspecialidade(user.specialty || "");
          setProfilePictureUrl(user.profilePictureUrl || "");
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        showError("Erro ao carregar perfil do usuário");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, showError]);

  const handleBack = () => {
    router.back();
  };

  const handleSalvar = async () => {
    // Validação básica
    if (!nome.trim()) {
      showError("O nome é obrigatório");
      return;
    }

    setIsSaving(true);
    try {
      // Preparar dados para atualização (apenas campos editáveis)
      const updateData: {
        name?: string;
        phone?: string;
        crm?: string;
        specialty?: string;
      } = {};

      if (nome !== user?.name) updateData.name = nome;
      if (telefone !== user?.phone) updateData.phone = telefone;
      if (crm !== user?.crm) updateData.crm = crm;
      if (especialidade !== user?.specialty) updateData.specialty = especialidade;

      // Chamar API para atualizar perfil
      await platformAuthService.updateProfile(updateData);
      
      // Atualizar dados do usuário no contexto
      await refreshUser();
      
      showSuccess("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      showError(error instanceof Error ? error.message : "Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelar = () => {
    // Restaurar valores originais
    if (user) {
      setNome(user.name || "");
      setEmail(user.email || "");
      setTelefone(user.phone || "");
      setCrm(user.crm || "");
      setEspecialidade(user.specialty || "");
    }
  };

  const handleProfilePictureUpload = async (imageUrl: string) => {
    setProfilePictureUrl(imageUrl);
    // Refresh user data to get the updated profile picture
    await refreshUser();
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: theme.backgroundSoft,
        }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 4,
      }}
    >
      {/* Container principal */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 4 },
          pt: 3,
        }}
      >
        {/* Botão Voltar */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: "18px" }} />}
            onClick={handleBack}
            sx={{
              color: theme.textDark,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              px: 0,
              minWidth: "auto",
              bgcolor: "transparent",
              "&:hover": {
                bgcolor: "transparent",
                opacity: 0.8,
              },
            }}
          >
            Voltar
          </Button>
        </Box>

        {/* Layout de duas colunas */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
            gap: 3,
          }}
        >
          {/* Sidebar esquerda - Informações pessoais */}
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              p: 3,
              height: "fit-content",
            }}
          >
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 700,
                color: theme.textDark,
                mb: 3,
              }}
            >
              Informações pessoais
            </Typography>

            {/* Avatar e nome */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar
                src={profilePictureUrl}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: theme.avatarBackground,
                  color: theme.primary,
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              >
                {!profilePictureUrl && nome ? getInitials(nome) : "?"}
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: theme.textDark,
                  }}
                >
                  {nome || "Usuário"}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: theme.textMuted,
                  }}
                >
                  Médico
                </Typography>
              </Box>
            </Box>

            {/* E-mail */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.textMuted,
                  mb: 0.5,
                }}
              >
                E-mail
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: theme.textDark,
                  wordBreak: "break-word",
                }}
              >
                {email || "não informado"}
              </Typography>
            </Box>

            {/* Telefone */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.textMuted,
                  mb: 0.5,
                }}
              >
                Telefone
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: theme.textDark,
                }}
              >
                {telefone || "não informado"}
              </Typography>
            </Box>

            {/* CRM */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.textMuted,
                  mb: 0.5,
                }}
              >
                CRM
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: theme.textDark,
                }}
              >
                {crm || "não informado"}
              </Typography>
            </Box>

            {/* Especialidade */}
            <Box>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.textMuted,
                  mb: 0.5,
                }}
              >
                Especialidade
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: theme.textDark,
                }}
              >
                {especialidade || "não informado"}
              </Typography>
            </Box>
          </Box>

          {/* Conteúdo principal - Formulário de edição */}
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              p: 4,
            }}
          >
            {/* Seção: Alterar foto */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: theme.textDark,
                  mb: 3,
                }}
              >
                Alterar foto
              </Typography>

              <ProfilePictureUpload
                currentImageUrl={profilePictureUrl}
                userName={nome}
                onUploadSuccess={handleProfilePictureUpload}
                size={100}
              />
            </Box>

            {/* Divider */}
            <Box sx={{ borderBottom: `1px solid #E5E7EB`, my: 4 }} />

            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                color: theme.textDark,
                mb: 4,
              }}
            >
              Dados do Perfil
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600 }}>
              {/* Nome */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: theme.textDark,
                    mb: 1,
                  }}
                >
                  Nome completo*
                </Typography>
                <TextField
                  fullWidth
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome completo"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      borderRadius: "8px",
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: "#E5E7EB",
                      },
                      "&:hover fieldset": {
                        borderColor: theme.textDark,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.primary,
                      },
                    },
                  }}
                />
              </Box>

              {/* E-mail (não editável) */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: theme.textDark,
                    mb: 1,
                  }}
                >
                  E-mail
                </Typography>
                <TextField
                  fullWidth
                  value={email}
                  disabled
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      borderRadius: "8px",
                      bgcolor: "#F9FAFB",
                      "& fieldset": {
                        borderColor: "#E5E7EB",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "#F9FAFB",
                      },
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: theme.textMuted,
                    mt: 0.5,
                  }}
                >
                  O e-mail não pode ser alterado
                </Typography>
              </Box>

              {/* Telefone */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: theme.textDark,
                    mb: 1,
                  }}
                >
                  Telefone
                </Typography>
                <TextField
                  fullWidth
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      borderRadius: "8px",
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: "#E5E7EB",
                      },
                      "&:hover fieldset": {
                        borderColor: theme.textDark,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.primary,
                      },
                    },
                  }}
                />
              </Box>

              {/* CRM */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: theme.textDark,
                    mb: 1,
                  }}
                >
                  CRM
                </Typography>
                <TextField
                  fullWidth
                  value={crm}
                  onChange={(e) => setCrm(e.target.value)}
                  placeholder="Digite seu CRM"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      borderRadius: "8px",
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: "#E5E7EB",
                      },
                      "&:hover fieldset": {
                        borderColor: theme.textDark,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.primary,
                      },
                    },
                  }}
                />
              </Box>

              {/* Especialidade */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: theme.textDark,
                    mb: 1,
                  }}
                >
                  Especialidade
                </Typography>
                <TextField
                  fullWidth
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  placeholder="Digite sua especialidade"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      borderRadius: "8px",
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: "#E5E7EB",
                      },
                      "&:hover fieldset": {
                        borderColor: theme.textDark,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.primary,
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Botões de ação */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={handleCancelar}
                disabled={isSaving}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  borderColor: "#E5E7EB",
                  color: theme.textDark,
                  px: 4,
                  fontWeight: 600,
                  fontSize: "14px",
                  "&:hover": {
                    borderColor: theme.textDark,
                    bgcolor: "transparent",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleSalvar}
                disabled={isSaving}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  bgcolor: theme.textDark,
                  color: "white",
                  px: 4,
                  fontWeight: 600,
                  fontSize: "14px",
                  "&:hover": {
                    bgcolor: theme.textDark,
                    opacity: 0.9,
                  },
                }}
              >
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

