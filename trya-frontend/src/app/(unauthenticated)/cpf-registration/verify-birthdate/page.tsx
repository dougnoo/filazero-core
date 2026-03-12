"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLoading from "@/shared/components/PageLoading";
import { Link, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { useToast } from "@/shared/context/ToastContext";
import { authService } from "@/shared/services/authService";
import { getUrlWithTenant, addTenantToUrl } from "@/shared/utils/tenantUtils";
import { AuthLayout, AuthButton } from "@/shared/components/auth";

function VerifyBirthdateContent() {
  const router = useRouter();
  const { tenant } = useTenantAssets();
  const { showError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [birthDate, setBirthDate] = useState<Dayjs | null>(null);
  const [canAccess, setCanAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const hash = sessionStorage.getItem("cpfRegistrationHash");
    if (!hash) {
      router.replace(addTenantToUrl("/cpf-registration", tenant));
      setCanAccess(false);
    } else {
      setCanAccess(true);
    }
  }, [router, tenant]);

  // Validate: date exists and is not in the future
  const isBirthDateValid = birthDate !== null && birthDate.isValid() && !birthDate.isAfter(dayjs());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBirthDateValid || !birthDate) {
      showError("Data de nascimento inválida");
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
      const response = await authService.verifyBirthdate({
        registrationHash,
        birthDate: birthDate.format("YYYY-MM-DD"),
      });

      if (response.isValid) {
        sessionStorage.setItem(
          "cpfRegistrationHash",
          response.registrationHash
        );
        router.push(
          addTenantToUrl(
            "/cpf-registration/complete-registration",
            tenant
          )
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao verificar data de nascimento";
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
      title="Vamos validar sua data de nascimento"
      subtitle="Informe sua data de nascimento para validação dos dados."
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <DatePicker
          value={birthDate}
          onChange={(newValue) => setBirthDate(newValue)}
          label="Data de nascimento"
          maxDate={dayjs()}
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              error: birthDate !== null && !isBirthDateValid,
              helperText:
                birthDate !== null && !isBirthDateValid
                  ? "Data não pode ser futura"
                  : "",
              sx: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              },
            },
          }}
        />

        <AuthButton
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          isValid={isBirthDateValid}
        >
          {isLoading ? "Verificando..." : "Continuar"}
        </AuthButton>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Link
            href={getUrlWithTenant(`/cpf-registration`, tenant)}
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

export default function VerifyBirthdatePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <VerifyBirthdateContent />
    </Suspense>
  );
}
