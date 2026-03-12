'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import PageLoading from '@/shared/components/PageLoading';
import { RoleEnum } from '@/shared/role';
import { platformAuthService } from '@/shared/services/platformAuthService';
import { AuthLayout, AuthButton, PasswordField } from '@/shared/components/auth';
import { useToast } from '@/shared/hooks/useToast';

function MedicoFirstAccessContent() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const [formData, setFormData] = useState({
    otpCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if session exists in sessionStorage
    const session = platformAuthService.getFirstAccessSession();
    const email = sessionStorage.getItem('platform_first_access_email');

    if (!session || !email) {
      setCanAccess(false);
      router.replace('/medico/login');
    } else {
      setCanAccess(true);
    }
  }, [router]);

  // Password validation: minimum 8 characters, uppercase, lowercase, number
  const validatePassword = (password: string): boolean => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  };

  const isOtpValid = formData.otpCode.trim() !== '' && formData.otpCode.length === 6;
  const isNewPasswordValid = formData.newPassword.trim() !== '' && validatePassword(formData.newPassword);
  const isConfirmPasswordValid = formData.confirmPassword.trim() !== '';
  const doPasswordsMatch = formData.newPassword === formData.confirmPassword;
  const isFormValid = isOtpValid && isNewPasswordValid && isConfirmPasswordValid && doPasswordsMatch;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otpCode || !formData.newPassword || !formData.confirmPassword) {
      showError('Por favor, preencha todos os campos');
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      showError('A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e número');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    setIsLoadingReset(true);

    try {
      const session = platformAuthService.getFirstAccessSession();
      const email = sessionStorage.getItem('platform_first_access_email');

      if (!session || !email) {
        showError('Sessão expirada. Por favor, faça login novamente.');
        router.push('/medico/login');
        return;
      }

      // Step 1: Verify OTP
      await platformAuthService.verifyOtp({
        email,
        otpCode: formData.otpCode,
        session,
      });

      // Step 2: Complete new password
      await platformAuthService.completeNewPassword({
        email,
        newPassword: formData.newPassword,
        session,
      });

      // Clear session data
      platformAuthService.clearFirstAccessSession();
      sessionStorage.removeItem('platform_first_access_email');

      showSuccess('Senha configurada com sucesso! Redirecionando...');
      
      // Redirect to medical dashboard
      setTimeout(() => {
        router.push('/medico');
      }, 1500);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao configurar senha';
      showError(errorMessage);
    } finally {
      setIsLoadingReset(false);
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
      title="Primeiro Acesso" 
      subtitle="Configure sua nova senha para continuar."
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <PasswordField
          name="otpCode"
          value={formData.otpCode}
          onChange={handleInputChange}
          label="Código OTP"
          required
          error={formData.otpCode.trim() !== '' && !isOtpValid}
          helperText={formData.otpCode.trim() !== '' && !isOtpValid ? 'O código deve ter 6 dígitos' : ''}
        />

        <PasswordField
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          label="Nova senha"
          required
          error={formData.newPassword.trim() !== '' && !isNewPasswordValid}
          helperText={formData.newPassword.trim() !== '' && !isNewPasswordValid ? 'Mínimo 8 caracteres, incluindo maiúscula, minúscula e número' : ''}
        />

        <PasswordField
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          label="Confirmar senha"
          required
          error={formData.confirmPassword.trim() !== '' && !doPasswordsMatch}
          helperText={formData.confirmPassword.trim() !== '' && !doPasswordsMatch ? 'As senhas não coincidem' : ''}
        />

        <AuthButton
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoadingReset}
          isValid={isFormValid}
          role={RoleEnum.Medico}
        >
          {isLoadingReset ? "Configurando..." : "Configurar Senha"}
        </AuthButton>
      </Box>
    </AuthLayout>
  );
}

export default function MedicoFirstAccessPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MedicoFirstAccessContent />
    </Suspense>
  );
}
