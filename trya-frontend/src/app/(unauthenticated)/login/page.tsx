"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import PageLoading from "@/shared/components/PageLoading";
import { Link, Box, Alert, Snackbar } from "@mui/material";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { authService } from "@/shared/services/authService";
import { getUrlWithTenant, addTenantToUrl } from "@/shared/utils/tenantUtils";
import { getRouteByRole } from "@/shared/utils/roleRedirect";
import { AuthLayout, AuthTextField, AuthButton, PasswordField } from "@/shared/components/auth";

interface NewPasswordError extends Error {
  session: string;
}

function LoginContent() {
  const router = useRouter();
  const { tenant: currentTheme } = useTenantAssets();
  
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Validations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = formData.email.trim() !== "" && emailRegex.test(formData.email);
  const isPasswordValid = formData.password.trim() !== "" && formData.password.length >= 8;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Por favor, preencha todos os campos");
      return;
    }
    if (formData.password.length < 8) {
      setError("Senha deve ter no mínimo 8 caracteres");
      return;
    }

    setIsLoadingLogin(true);
    try {
      await authService.login({
        email: formData.email,
        password: formData.password,
      });

      try {
        const userProfile = await authService.getUserProfile();
        const route = getRouteByRole(userProfile.role);
        const urlWithTenant = addTenantToUrl(route, currentTheme);
        router.push(urlWithTenant);
      } catch {
        const urlWithTenant = addTenantToUrl('/paciente', currentTheme);
        router.push(urlWithTenant);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "NEW_PASSWORD_REQUIRED") {
        const session = (err as NewPasswordError).session;
        const newPasswordData = {
          email: formData.email,
          password: formData.password,
          session,
          type: "new-password",
        };
        sessionStorage.setItem("newPasswordData", JSON.stringify(newPasswordData));
        localStorage.setItem("user_is_first_login", "true");
        router.push(addTenantToUrl(`/password-reset/verify`, currentTheme));
        return;
      }

      // Trata erro de primeiro login com CPF
      if (err instanceof Error && 'isFirstLoginCpf' in err && (err as Error & { isFirstLoginCpf: boolean }).isFirstLoginCpf) {
        // Redireciona para a página de registro com CPF usando replace para evitar loop
        const targetUrl = addTenantToUrl(`/cpf-registration`, currentTheme);
        router.replace(targetUrl);
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(errorMessage);
    } finally {
      setIsLoadingLogin(false);
    }
  };

  return (
    <AuthLayout
      title="Entrar na plataforma"
      subtitle="Acesse com suas credenciais para continuar."
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <AuthTextField
          fullWidth
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          label="E-mail"
          required
          autoComplete="username"
          error={formData.email.trim() !== "" && !isEmailValid}
          helperText={formData.email.trim() !== "" && !isEmailValid ? "Digite um e-mail válido" : ""}
        />

        <PasswordField
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          label="Senha"
          required
          error={formData.password.trim() !== "" && !isPasswordValid}
          helperText={formData.password.trim() !== "" && !isPasswordValid ? "Senha deve ter no mínimo 8 caracteres" : ""}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <Link
            href={getUrlWithTenant(`/password-reset`, currentTheme)}
            sx={{
              fontSize: { xs: "13px", sm: "14px" },
              textDecoration: "underline",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Esqueceu sua senha?
          </Link>
        </Box>

        <AuthButton
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoadingLogin}
          isValid={isFormValid}
        >
          {isLoadingLogin ? "Entrando..." : "Entrar"}
        </AuthButton>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Link
            href={getUrlWithTenant(`/cpf-registration`, currentTheme)}
            sx={{
              fontSize: { xs: "13px", sm: "14px" },
              textDecoration: "underline",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Primeiro acesso? Entrar por aqui
          </Link>
        </Box>
      </Box>

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

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginContent />
    </Suspense>
  );
}

