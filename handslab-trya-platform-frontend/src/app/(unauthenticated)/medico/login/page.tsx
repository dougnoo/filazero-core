"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import PageLoading from "@/shared/components/PageLoading";
import { Link, Box } from "@mui/material";
import { platformAuthService } from "@/shared/services/platformAuthService";
import { RoleEnum } from "@/shared/role";
import { AuthLayout, AuthTextField, AuthButton, PasswordField } from "@/shared/components/auth";
import { useToast } from "@/shared/hooks/useToast";

interface NewPasswordError extends Error {
  session: string;
  isNewPasswordRequired: boolean;
}

function MedicoLoginContent() {
  const router = useRouter();
  const { showError, showInfo } = useToast();
  
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
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

    if (!formData.email || !formData.password) {
      showError("Por favor, preencha todos os campos");
      return;
    }
    if (formData.password.length < 8) {
      showError("Senha deve ter no mínimo 8 caracteres");
      return;
    }

    setIsLoadingLogin(true);
    try {
      await platformAuthService.signIn({
        email: formData.email,
        password: formData.password,
      });

      // Success - redirect to medical dashboard
      router.push('/medico');
    } catch (err) {
      // Handle NEW_PASSWORD_REQUIRED (status 428)
      if (err instanceof Error && 'isNewPasswordRequired' in err && (err as NewPasswordError).isNewPasswordRequired) {
        const session = (err as NewPasswordError).session;
        
        // Store session in sessionStorage
        platformAuthService.storeFirstAccessSession(session);
        
        // Store email for first access flow
        sessionStorage.setItem('platform_first_access_email', formData.email);
        
        showInfo("É necessário definir uma nova senha");
        
        // Redirect to first access page
        router.push('/medico/first-access');
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
      showError(errorMessage);
    } finally {
      setIsLoadingLogin(false);
    }
  };

  return (
    <AuthLayout 
      title="Acesso médico Trya" 
      subtitle="Entre com suas credenciais para acessar o painel médico e validar as recomendações geradas pela IA."
      role={RoleEnum.Medico}
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
          error={formData.email.trim() !== "" && !isEmailValid}
          helperText={formData.email.trim() !== "" && !isEmailValid ? "Digite um e-mail válido" : ""}
          role={RoleEnum.Medico}
        />

        <PasswordField
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          label="Senha"
          required
          error={formData.password.trim() !== "" && !isPasswordValid}
          helperText={formData.password.trim() !== "" && !isPasswordValid ? "Senha deve ter no mínimo 8 caracteres" : ""}
          role={RoleEnum.Medico}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <Link
            href="/medico/password-reset"
            sx={{
              color: '#041616',
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
          role={RoleEnum.Medico}
        >
          {isLoadingLogin ? "Entrando..." : "Entrar"}
        </AuthButton>
      </Box>
    </AuthLayout>
  );
}

export default function MedicoLoginPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MedicoLoginContent />
    </Suspense>
  );
}
