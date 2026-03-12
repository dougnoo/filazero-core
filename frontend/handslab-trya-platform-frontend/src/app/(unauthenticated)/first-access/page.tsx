'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Alert, Snackbar } from '@mui/material';
import PageLoading from '@/shared/components/PageLoading';
import { useGlobalThemeContext } from '@/shared/context/GlobalThemeContext';
import { RoleEnum } from '@/shared/role';
import { addTenantToUrl } from '@/shared/utils/tenantUtils';
import { AuthLayout, AuthButton, PasswordField } from '@/shared/components/auth';

function FirstAccessContent() {
  const router = useRouter();
  const search = useSearchParams();
  const { currentTheme } = useGlobalThemeContext();
  
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let allowed = false;
    const storedData = sessionStorage.getItem('newPasswordData');

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed && (parsed.type === 'new-password' || parsed.session)) {
          allowed = true;
        }
      } catch (error) {
        // Erro ao verificar dados de nova senha
      }
    }

    if (!allowed) {
      const flowType = search?.get('type');
      if (flowType === 'new-password' || flowType === 'first-access') {
        allowed = true;
      }
    }

    setCanAccess(allowed);

    if (!allowed) {
      router.replace(addTenantToUrl(`/login`, currentTheme));
    }
  }, [search, router, currentTheme]);

  const isNewPasswordValid = formData.newPassword.trim() !== '' && formData.newPassword.length >= 6;
  const isConfirmPasswordValid = formData.confirmPassword.trim() !== '';
  const doPasswordsMatch = formData.newPassword === formData.confirmPassword;
  const isFormValid = isNewPasswordValid && isConfirmPasswordValid && doPasswordsMatch;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoadingReset(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      router.push(`/login`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar senha';
      setError(errorMessage);
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
      title="Atualize sua senha para continuar"
      subtitle="É necessário redefinir sua senha no primeiro login para manter seus dados protegidos."
      role={RoleEnum.Paciente}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <PasswordField
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          label="Nova senha"
          required
          error={formData.newPassword.trim() !== '' && !isNewPasswordValid}
          helperText={formData.newPassword.trim() !== '' && !isNewPasswordValid ? 'A senha deve ter pelo menos 6 caracteres' : ''}
          role={RoleEnum.Paciente}
        />

        <PasswordField
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          label="Confirme sua nova senha"
          required
          error={formData.confirmPassword.trim() !== '' && !doPasswordsMatch}
          helperText={formData.confirmPassword.trim() !== '' && !doPasswordsMatch ? 'As senhas não coincidem' : ''}
          role={RoleEnum.Paciente}
        />

        <AuthButton
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoadingReset}
          isValid={isFormValid}
          role={RoleEnum.Paciente}
        >
          {isLoadingReset ? 'Salvando...' : 'Salvar e continuar'}
        </AuthButton>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
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
