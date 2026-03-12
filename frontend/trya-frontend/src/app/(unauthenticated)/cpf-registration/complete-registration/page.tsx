"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLoading from "@/shared/components/PageLoading";
import { Link, Box } from "@mui/material";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { useToast } from "@/shared/context/ToastContext";
import { authService } from "@/shared/services/authService";
import { getUrlWithTenant, addTenantToUrl } from "@/shared/utils/tenantUtils";
import { formatPhone, unformatPhone } from "@/shared/utils/formatters";
import { validateEmail } from "@/shared/utils/validators";
import {
  AuthLayout,
  AuthTextField,
  AuthButton,
} from "@/shared/components/auth";

function CompleteRegistrationContent() {
  const router = useRouter();
  const { tenant } = useTenantAssets();
  const { showError, showSuccess } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
  });

  useEffect(() => {
    const hash = sessionStorage.getItem("cpfRegistrationHash");
    if (!hash) {
      router.replace(addTenantToUrl("/cpf-registration", tenant));
      setCanAccess(false);
    } else {
      setCanAccess(true);
    }
  }, [router, tenant]);

  const isEmailValid =
    formData.email.trim() !== "" && validateEmail(formData.email);
  const phoneNumbers = unformatPhone(formData.phone);
  const isPhoneValid =
    phoneNumbers.length === 0 ||
    phoneNumbers.length === 10 ||
    phoneNumbers.length === 11;
  const isFormValid = isEmailValid && isPhoneValid;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid) {
      showError("Digite um e-mail válido");
      return;
    }

    const registrationHash = sessionStorage.getItem("cpfRegistrationHash");
    if (!registrationHash) {
      showError("Sessão expirada. Por favor, inicie o processo novamente.");
      router.push(addTenantToUrl("/cpf-registration", tenant));
      return;
    }

    setIsLoading(true);
    try {
      const payload: {
        registrationHash: string;
        email: string;
        phone?: string;
      } = {
        registrationHash,
        email: formData.email,
      };

      // Aceita telefone com 10 ou 11 dígitos
      if (phoneNumbers.length === 10 || phoneNumbers.length === 11) {
        payload.phone = phoneNumbers;
      }

      const response = await authService.completeRegistration(payload);

      sessionStorage.removeItem("cpfRegistrationHash");
      showSuccess(response.message);

      setTimeout(() => {
        router.push(addTenantToUrl("/login", tenant));
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao completar cadastro";
      showError(errorMessage);

      // Se o hash expirou, redireciona para o início
      if (
        errorMessage.includes("expirado") ||
        errorMessage.includes("inválido")
      ) {
        sessionStorage.removeItem("cpfRegistrationHash");
        setTimeout(() => {
          router.push(addTenantToUrl("/cpf-registration", tenant));
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (canAccess === null) {
    return <PageLoading />;
  }

  if (!canAccess) {
    return null;
  }

  return (
    <AuthLayout
      title="Complete seus dados de acesso"
      subtitle="Informe seu e-mail e telefone para continuar seu primeiro acesso à plataforma."
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
          value={formData.email}
          onChange={handleInputChange}
          label="E-mail"
          required
          error={formData.email.trim() !== "" && !isEmailValid}
          helperText={
            formData.email.trim() !== "" && !isEmailValid
              ? "Digite um e-mail válido"
              : ""
          }
        />

        <AuthTextField
          fullWidth
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          label="Telefone (opcional)"
          placeholder="(00) 0000-0000"
          error={formData.phone.trim() !== "" && !isPhoneValid}
          helperText={
            formData.phone.trim() !== "" && !isPhoneValid
              ? "Digite um telefone válido com DDD (10 ou 11 dígitos)"
              : ""
          }
          slotProps={{htmlInput: { maxLength: 15 }}}
        />

        <AuthButton
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          isValid={isFormValid}
        >
          {isLoading ? "Concluindo..." : "Concluir cadastro"}
        </AuthButton>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Link
            href={getUrlWithTenant(
              `/cpf-registration/verify-birthdate`,
              tenant
            )}
            sx={{
              fontSize: { xs: "13px", sm: "14px" },
              textDecoration: "underline",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Voltar
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CompleteRegistrationContent />
    </Suspense>
  );
}
