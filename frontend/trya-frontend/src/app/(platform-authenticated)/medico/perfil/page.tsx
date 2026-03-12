"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { usePlatformAuth } from "@/shared/hooks/usePlatformAuth";
import { platformAuthService } from "@/shared/services/platformAuthService";
import { useToast } from "@/shared/hooks/useToast";
import ProfilePictureUpload from "@/shared/components/ProfilePictureUpload";
import { MemedIntegrationSection } from "./components/MemedIntegrationSection";

export default function PerfilPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user, refreshUser } = usePlatformAuth();
  const { showError, showSuccess, showInfo } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para alteração de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [senhaErrors, setSenhaErrors] = useState<{
    senhaAtual?: string;
    novaSenha?: string;
    confirmarSenha?: string;
  }>({});

  // Estados para visualização (apenas leitura)
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

  const validatePasswordFields = (): boolean => {
    const errors: typeof senhaErrors = {};
    const anyPasswordFilled = senhaAtual || novaSenha || confirmarSenha;

    if (anyPasswordFilled) {
      if (!senhaAtual) {
        errors.senhaAtual = "A senha atual é obrigatória";
      }
      if (!novaSenha) {
        errors.novaSenha = "A nova senha é obrigatória";
      } else if (novaSenha.length < 8) {
        errors.novaSenha = "A nova senha deve ter pelo menos 8 caracteres";
      }
      if (!confirmarSenha) {
        errors.confirmarSenha = "A confirmação da senha é obrigatória";
      } else if (novaSenha !== confirmarSenha) {
        errors.confirmarSenha = "As senhas não coincidem";
      }
    }

    setSenhaErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSalvar = async () => {
    // Validar campos de senha
    if (!validatePasswordFields()) {
      return;
    }

    const anyPasswordFilled = senhaAtual || novaSenha || confirmarSenha;

    if (!anyPasswordFilled) {
      showInfo("Preencha os campos de senha para salvar");
      return;
    }

    setIsSaving(true);
    try {
      await platformAuthService.changePassword({
        currentPassword: senhaAtual,
        newPassword: novaSenha,
      });
      // Limpar campos de senha após sucesso
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSenhaErrors({});
      showSuccess("Senha alterada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showError(
        error instanceof Error ? error.message : "Erro ao alterar senha"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelar = () => {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setSenhaErrors({});
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
          bgcolor: 'background.default',
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
              color: 'text.primary',
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
                  bgcolor: 'primary.light',
                  color: 'primary.main',
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
                  }}
                >
                  {nome || "Usuário"}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: 'grey.800',
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
                  color: 'grey.800',
                  mb: 0.5,
                }}
              >
                E-mail
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
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
                  color: 'grey.800',
                  mb: 0.5,
                }}
              >
                Telefone
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
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
                  color: 'grey.800',
                  mb: 0.5,
                }}
              >
                CRM
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
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
                  color: 'grey.800',
                  mb: 0.5,
                }}
              >
                Especialidade
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
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
                  fontSize: "18px",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Alterar foto
              </Typography>

              <ProfilePictureUpload
                currentImageUrl={profilePictureUrl}
                userName={nome}
                onUploadSuccess={handleProfilePictureUpload}
                size={80}
                alwaysShowRemove
              />
            </Box>

            {/* Divider */}
            <Box sx={{ borderBottom: `1px solid #E5E7EB`, my: 4 }} />

            {/* Seção: Alterar senha */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Alterar senha
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 400 }}>
                {/* Senha atual */}
                <TextField
                  fullWidth
                  label="Senha atual"
                  type={showSenhaAtual ? "text" : "password"}
                  value={senhaAtual}
                  onChange={(e) => {
                    setSenhaAtual(e.target.value);
                    if (senhaErrors.senhaAtual) {
                      setSenhaErrors((prev) => ({
                        ...prev,
                        senhaAtual: undefined,
                      }));
                    }
                  }}
                  placeholder="Input"
                  error={!!senhaErrors.senhaAtual}
                  helperText={senhaErrors.senhaAtual}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                          edge="end"
                          size="small"
                          sx={{ color: 'grey.800' }}
                        >
                          {showSenhaAtual ? (
                            <Visibility sx={{ fontSize: 20 }} />
                          ) : (
                            <VisibilityOff sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      fontSize: "14px",
                      color: 'grey.800',
                      "&.Mui-focused": {
                        color: 'primary.main',
                      },
                    },
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      borderRadius: "8px",
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: senhaErrors.senhaAtual
                          ? "#d32f2f"
                          : "#E5E7EB",
                      },
                      "&:hover fieldset": {
                        borderColor: senhaErrors.senhaAtual
                          ? "#d32f2f"
                          : 'text.primary',
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: senhaErrors.senhaAtual
                          ? "#d32f2f"
                          : 'primary.main',
                      },
                    },
                  }}
                />

                {/* Nova senha */}
                <TextField
                  fullWidth
                  label="Nova senha"
                  type={showNovaSenha ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    if (senhaErrors.novaSenha) {
                      setSenhaErrors((prev) => ({
                        ...prev,
                        novaSenha: undefined,
                      }));
                    }
                  }}
                  placeholder="Input"
                  error={!!senhaErrors.novaSenha}
                  helperText={senhaErrors.novaSenha}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNovaSenha(!showNovaSenha)}
                          edge="end"
                          size="small"
                          sx={{ color: 'grey.800' }}
                        >
                          {showNovaSenha ? (
                            <Visibility sx={{ fontSize: 20 }} />
                          ) : (
                            <VisibilityOff sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      fontSize: "14px",
                      color: 'grey.800',
                      "&.Mui-focused": {
                        color: 'primary.main',
                      },
                    },
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      borderRadius: "8px",
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: senhaErrors.novaSenha
                          ? "#d32f2f"
                          : "#E5E7EB",
                      },
                      "&:hover fieldset": {
                        borderColor: senhaErrors.novaSenha
                          ? "#d32f2f"
                          : 'text.primary',
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: senhaErrors.novaSenha
                          ? "#d32f2f"
                          : 'primary.main',
                      },
                    },
                  }}
                />

                {/* Confirmar nova senha */}
                <TextField
                  fullWidth
                  label="Confirme sua nova senha"
                  type={showConfirmarSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => {
                    setConfirmarSenha(e.target.value);
                    if (senhaErrors.confirmarSenha) {
                      setSenhaErrors((prev) => ({
                        ...prev,
                        confirmarSenha: undefined,
                      }));
                    }
                  }}
                  placeholder="Input"
                  error={!!senhaErrors.confirmarSenha}
                  helperText={senhaErrors.confirmarSenha}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmarSenha(!showConfirmarSenha)
                          }
                          edge="end"
                          size="small"
                          sx={{ color: 'grey.800' }}
                        >
                          {showConfirmarSenha ? (
                            <Visibility sx={{ fontSize: 20 }} />
                          ) : (
                            <VisibilityOff sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      fontSize: "14px",
                      color: 'grey.800',
                      "&.Mui-focused": {
                        color: 'primary.main',
                      },
                    },
                    "& .MuiOutlinedInput-root": {
                      fontSize: "14px",
                      borderRadius: "8px",
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: senhaErrors.confirmarSenha
                          ? "#d32f2f"
                          : "#E5E7EB",
                      },
                      "&:hover fieldset": {
                        borderColor: senhaErrors.confirmarSenha
                          ? "#d32f2f"
                          : 'text.primary',
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: senhaErrors.confirmarSenha
                          ? "#d32f2f"
                          : 'primary.main',
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
                mb: 4,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={handleCancelar}
                disabled={isSaving}
                color="error"
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleSalvar}
                disabled={isSaving}
                color="primary"
              >
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </Box>

            {/* Memed Integration Section */}
            {user?.id && (
              <MemedIntegrationSection
                doctorId={user.id}
                currentBoardCode={crm?.split(" ")[0]}
                currentBoardNumber={crm?.split(" ")[1]?.split("/")[0]}
                currentBoardState={crm?.split("/")[1]}
                onSyncSuccess={() => {
                  refreshUser();
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
