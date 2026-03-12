"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import PageLoading from "@/shared/components/PageLoading";
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Link,
  Snackbar,
  Typography,
} from "@mui/material";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { useToast } from "@/shared/context/ToastContext";
import { termsService } from "@/shared/services/termsService";
import { authService } from "@/shared/services/authService";
import { addTenantToUrl, getUrlWithTenant } from "@/shared/utils/tenantUtils";
import { getRouteByRole } from "@/shared/utils/roleRedirect";
import { AuthLayout, AuthTextField, AuthButton, PasswordField } from "@/shared/components/auth";
import { DocumentModal } from "@/shared/components/DocumentModal";

interface NewPasswordError extends Error {
  session: string;
}

function FirstAccessContent() {
  const router = useRouter();
  const { tenant } = useTenantAssets();
  const { showError } = useToast();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Terms acceptance state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  
  // Document URLs state
  const [termsUrl, setTermsUrl] = useState("");
  const [privacyUrl, setPrivacyUrl] = useState("");
  const [isLoadingTermsUrl, setIsLoadingTermsUrl] = useState(false);
  const [isLoadingPrivacyUrl, setIsLoadingPrivacyUrl] = useState(false);

  // Validations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email.trim() !== "" && emailRegex.test(email);
  const isPasswordValid = password.trim() !== "" && password.length >= 8;
  const isFormValid = isEmailValid && isPasswordValid && termsAccepted && privacyAccepted;

  // Load terms URL from service
  const loadTermsUrl = async () => {
    if (termsUrl) return; // Already loaded

    setIsLoadingTermsUrl(true);
    try {
      const term = await termsService.getTermByType("TERMS_OF_USE");
      if (term) {
        setTermsUrl(term.s3Url);
      }
    } catch (error) {
      console.error("Erro ao carregar termos:", error);
      showError("Erro ao carregar termos de uso");
    } finally {
      setIsLoadingTermsUrl(false);
    }
  };

  // Load privacy URL from service
  const loadPrivacyUrl = async () => {
    if (privacyUrl) return; // Already loaded

    setIsLoadingPrivacyUrl(true);
    try {
      const term = await termsService.getTermByType("PRIVACY_POLICY");
      if (term) {
        setPrivacyUrl(term.s3Url);
      }
    } catch (error) {
      console.error("Erro ao carregar política de privacidade:", error);
      showError("Erro ao carregar política de privacidade");
    } finally {
      setIsLoadingPrivacyUrl(false);
    }
  };

  // Handle opening terms modal
  const handleOpenTermsModal = async () => {
    setTermsModalOpen(true);
    await loadTermsUrl();
  };

  // Handle opening privacy modal
  const handleOpenPrivacyModal = async () => {
    setPrivacyModalOpen(true);
    await loadPrivacyUrl();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.login({
        email,
        password,
      });

      // On success, redirect based on user role
      try {
        const userProfile = await authService.getUserProfile();
        const route = getRouteByRole(userProfile.role);
        const urlWithTenant = addTenantToUrl(route, tenant);
        router.push(urlWithTenant);
      } catch {
        // Default to patient route if profile fetch fails
        const urlWithTenant = addTenantToUrl('/paciente', tenant);
        router.push(urlWithTenant);
      }
    } catch (err) {
      // Handle NEW_PASSWORD_REQUIRED challenge
      if (err instanceof Error && err.message === "NEW_PASSWORD_REQUIRED") {
        const session = (err as NewPasswordError).session;
        const newPasswordData = {
          email,
          password,
          session,
          type: "new-password",
        };
        sessionStorage.setItem("newPasswordData", JSON.stringify(newPasswordData));
        localStorage.setItem("user_is_first_login", "true");
        router.push(addTenantToUrl(`/password-reset/verify`, tenant));
        return;
      }

      // Handle other errors
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Primeiro acesso à plataforma"
      subtitle="Acesse com suas credenciais para continuar sua jornada de cuidado."
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <AuthTextField
          fullWidth
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="E-mail"
          required
          error={email.trim() !== "" && !isEmailValid}
          helperText={email.trim() !== "" && !isEmailValid ? "Digite um e-mail válido" : ""}
        />

        <PasswordField
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Senha"
          required
          error={password.trim() !== "" && !isPasswordValid}
          helperText={password.trim() !== "" && !isPasswordValid ? "Senha deve ter no mínimo 8 caracteres" : ""}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
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
                Declaro que li e concordo com os{" "}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 600,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenTermsModal();
                  }}
                >
                  Termos de uso
                </Box>
                .
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
                Estou ciente de que meus dados pessoais serão tratados conforme
                descrito na{" "}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 600,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPrivacyModal();
                  }}
                >
                  Política de privacidade
                </Box>
                .
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

        <AuthButton
          type="submit"
          fullWidth
          variant="contained"
          disabled={!isFormValid || isLoading}
          isValid={isFormValid}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </AuthButton>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Link
            href={getUrlWithTenant(`/login`, tenant)}
            sx={{
              fontSize: { xs: "13px", sm: "14px" },
              textDecoration: "underline",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Já tem conta? Fazer login
          </Link>
        </Box>
      </Box>

      <DocumentModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        documentUrl={termsUrl}
        title="Termos de uso"
        isLoading={isLoadingTermsUrl}
      />

      <DocumentModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        documentUrl={privacyUrl}
        title="Política de privacidade"
        isLoading={isLoadingPrivacyUrl}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
}

export default function FirstAccessPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <FirstAccessContent />
    </Suspense>
  );
}
