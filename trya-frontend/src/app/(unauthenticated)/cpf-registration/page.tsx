"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import PageLoading from "@/shared/components/PageLoading";
import {
  Link,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { useToast } from "@/shared/context/ToastContext";
import { authService } from "@/shared/services/authService";
import { termsService } from "@/shared/services/termsService";
import { getUrlWithTenant, addTenantToUrl } from "@/shared/utils/tenantUtils";
import { formatCPF, unformatCPF } from "@/shared/utils/formatters";
import { validateCPF } from "@/shared/utils/validators";
import {
  AuthLayout,
  AuthTextField,
  AuthButton,
} from "@/shared/components/auth";
import { DocumentModal } from "@/shared/components/DocumentModal";

function CpfRegistrationContent() {
  const router = useRouter();
  const { tenant } = useTenantAssets();
  const { showError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [cpf, setCpf] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsUrl, setTermsUrl] = useState("");
  const [privacyUrl, setPrivacyUrl] = useState("");
  const [isLoadingTermsUrl, setIsLoadingTermsUrl] = useState(false);
  const [isLoadingPrivacyUrl, setIsLoadingPrivacyUrl] = useState(false);

  const cpfNumbers = unformatCPF(cpf);
  const isCpfValid = validateCPF(cpf);
  const isFormValid = isCpfValid && termsAccepted && privacyAccepted;


  const loadTermsUrl = async () => {
    if (termsUrl) return; // Já carregado

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

  const loadPrivacyUrl = async () => {
    if (privacyUrl) return; // Já carregado

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

  const handleOpenTermsModal = async () => {
    setTermsModalOpen(true);
    await loadTermsUrl();
  };

  const handleOpenPrivacyModal = async () => {
    setPrivacyModalOpen(true);
    await loadPrivacyUrl();
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCpfValid) {
      showError("CPF inválido");
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      showError("É necessário aceitar os termos e a política de privacidade");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyCpf({ cpf: cpfNumbers });

      if (response.canProceed) {
        sessionStorage.setItem(
          "cpfRegistrationHash",
          response.registrationHash
        );
        router.push(
          addTenantToUrl("/cpf-registration/verify-birthdate", tenant)
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao verificar CPF";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Primeiro acesso à plataforma"
      subtitle="Para continuar, informe seu CPF."
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <AuthTextField
          fullWidth
          name="cpf"
          value={cpf}
          onChange={handleCpfChange}
          label="CPF"
          required
          placeholder="000.000.000-00"
          error={cpf.trim() !== "" && !isCpfValid}
          helperText={
            cpf.trim() !== "" && !isCpfValid
              ? "Digite um CPF válido"
              : !termsAccepted || !privacyAccepted
              ? "Leia e aceite os termos e a política de privacidade para continuar"
              : ""
          }
          inputProps={{ maxLength: 14 }}
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
          disabled={isLoading || !isFormValid}
          isValid={isFormValid}
        >
          {isLoading ? "Verificando..." : "Continuar"}
        </AuthButton>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Link
            href={getUrlWithTenant(`/login`, tenant)}
            sx={{
              fontSize: { xs: "13px", sm: "14px" },
              textDecoration: "underline",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Voltar para login
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
    </AuthLayout>
  );
}

export default function CpfRegistrationPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CpfRegistrationContent />
    </Suspense>
  );
}
