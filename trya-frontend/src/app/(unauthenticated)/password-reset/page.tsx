'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLoading from '@/shared/components/PageLoading';
import { Link, Box, Alert, Snackbar } from '@mui/material';
import { useTenantAssets } from '@/shared/context/TenantThemeProvider';
import { authService } from '@/shared/services/authService';
import { getUrlWithTenant, addTenantToUrl } from '@/shared/utils/tenantUtils';
import { AuthLayout, AuthTextField, AuthButton } from '@/shared/components/auth';

function PasswordResetContent() {
  const router = useRouter();
  const { tenant } = useTenantAssets();
  
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  // Validação do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email.trim() !== '' && emailRegex.test(email);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!email.trim()) {
      setError('Por favor, digite seu e-mail');
      return;
    }

    if (!isEmailValid) {
      setError('Por favor, digite um e-mail válido');
      return;
    }

    setIsLoadingReset(true);

    try {
      await authService.forgotPassword({ email });
      
      setSuccess('E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.');
      
      // Redireciona para a página de verificação após 2 segundos
      setTimeout(() => {
        const baseUrl = `/password-reset/verify?email=${encodeURIComponent(email)}&type=password-reset`;
        router.push(addTenantToUrl(baseUrl, tenant));
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar e-mail de redefinição';
      setError(errorMessage);
    } finally {
      setIsLoadingReset(false);
    }
  };

  return (
    <AuthLayout
      title="Esqueceu sua senha?"
      subtitle="Digite seu e-mail para receber um código de verificação."
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <AuthTextField
          fullWidth
          type="email"
          name="email"
          value={email}
          onChange={handleInputChange}
          label="E-mail"
          required
          error={email.trim() !== '' && !isEmailValid}
          helperText={email.trim() !== '' && !isEmailValid ? 'Digite um e-mail válido' : ''}
        />

        <AuthButton
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoadingReset}
          isValid={isEmailValid}
          sx={{ marginTop: '32px' }}
        >
          {isLoadingReset ? 'Enviando...' : 'Enviar e-mail'}
        </AuthButton>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link
            href={getUrlWithTenant(`/login`, tenant)}
            sx={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '26px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'none',
              },
              '& .text': {
                textDecoration: 'underline',
              },
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_4626_5100)">
                <path 
                  d="M23.1428 12H0.857117" 
                  stroke="currentColor" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M6.85712 6L0.857117 12L6.85712 18" 
                  stroke="currentColor" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_4626_5100">
                  <rect width="24" height="24" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            <span className="text">Voltar para Login</span>
          </Link>
        </Box>
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

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PasswordResetContent />
    </Suspense>
  );
}

