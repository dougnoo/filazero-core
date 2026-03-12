'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLoading from '@/shared/components/PageLoading';
import { Link, Box } from '@mui/material';
import { platformAuthService } from '@/shared/services/platformAuthService';
import { RoleEnum } from '@/shared/role';
import { AuthLayout, AuthTextField, AuthButton, PasswordField } from '@/shared/components/auth';
import { useToast } from '@/shared/hooks/useToast';

function MedicoPasswordResetContent() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  
  const [emailData, setEmailData] = useState({ email: '' });
  const [resetData, setResetData] = useState({
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailData.email.trim() !== '' && emailRegex.test(emailData.email);

  // Reset form validation
  const isCodeValid = resetData.verificationCode.trim() !== '' && resetData.verificationCode.length === 6;
  const isNewPasswordValid = resetData.newPassword.trim() !== '' && resetData.newPassword.length >= 8;
  const isConfirmPasswordValid = resetData.confirmPassword.trim() !== '';
  const doPasswordsMatch = resetData.newPassword === resetData.confirmPassword;
  const isResetFormValid = isCodeValid && isNewPasswordValid && isConfirmPasswordValid && doPasswordsMatch;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailData({ email: e.target.value });
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.email.trim()) {
      showError('Por favor, digite seu e-mail');
      return;
    }

    if (!isEmailValid) {
      showError('Por favor, digite um e-mail válido');
      return;
    }

    setIsLoadingReset(true);

    try {
      await platformAuthService.forgotPassword({ email: emailData.email });
      
      showSuccess('Código de verificação enviado! Verifique seu e-mail.');
      setStep('reset');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar código';
      showError(errorMessage);
    } finally {
      setIsLoadingReset(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetData.verificationCode || !resetData.newPassword || !resetData.confirmPassword) {
      showError('Por favor, preencha todos os campos');
      return;
    }

    if (resetData.newPassword.length < 8) {
      showError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    setIsLoadingReset(true);

    try {
      await platformAuthService.confirmForgotPassword({
        email: emailData.email,
        verificationCode: resetData.verificationCode,
        newPassword: resetData.newPassword,
      });
      
      showSuccess('Senha redefinida com sucesso! Redirecionando...');
      
      setTimeout(() => {
        router.push('/medico/login');
      }, 1500);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao redefinir senha';
      showError(errorMessage);
    } finally {
      setIsLoadingReset(false);
    }
  };

  const title = step === 'email' ? 'Esqueceu sua senha?' : 'Redefinir senha';
  const subtitle = step === 'email' 
    ? 'Digite seu e-mail para receber um código de verificação.' 
    : 'Digite o código recebido e sua nova senha.';

  return (
    <AuthLayout 
      title={title}
      subtitle={subtitle}
    >
      {step === 'email' ? (
        <Box component="form" onSubmit={handleEmailSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <AuthTextField
            fullWidth
            type="email"
            name="email"
            value={emailData.email}
            onChange={handleEmailChange}
            label="E-mail"
            required
            error={emailData.email.trim() !== '' && !isEmailValid}
            helperText={emailData.email.trim() !== '' && !isEmailValid ? 'Digite um e-mail válido' : ''}
            role={RoleEnum.Medico}
          />

          <AuthButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoadingReset}
            isValid={isEmailValid}
            role={RoleEnum.Medico}
          >
            {isLoadingReset ? "Enviando..." : "Enviar código"}
          </AuthButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              href="/medico/login"
              sx={{
                color: '#041616',
                fontSize: { xs: "13px", sm: "14px" },
                textDecoration: "underline",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Voltar para o login
            </Link>
          </Box>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleResetSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <AuthTextField
            fullWidth
            type="text"
            name="verificationCode"
            value={resetData.verificationCode}
            onChange={handleResetChange}
            label="Código de verificação"
            required
            error={resetData.verificationCode.trim() !== '' && !isCodeValid}
            helperText={resetData.verificationCode.trim() !== '' && !isCodeValid ? 'O código deve ter 6 dígitos' : ''}
            role={RoleEnum.Medico}
          />

          <PasswordField
            name="newPassword"
            value={resetData.newPassword}
            onChange={handleResetChange}
            label="Nova senha"
            required
            error={resetData.newPassword.trim() !== '' && !isNewPasswordValid}
            helperText={resetData.newPassword.trim() !== '' && !isNewPasswordValid ? 'A senha deve ter no mínimo 8 caracteres' : ''}
          />

          <PasswordField
            name="confirmPassword"
            value={resetData.confirmPassword}
            onChange={handleResetChange}
            label="Confirmar senha"
            required
            error={resetData.confirmPassword.trim() !== '' && !doPasswordsMatch}
            helperText={resetData.confirmPassword.trim() !== '' && !doPasswordsMatch ? 'As senhas não coincidem' : ''}
          />

          <AuthButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoadingReset}
            isValid={isResetFormValid}
            role={RoleEnum.Medico}
          >
            {isLoadingReset ? "Redefinindo..." : "Redefinir senha"}
          </AuthButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              href="/medico/login"
              sx={{
                color: '#041616',
                fontSize: { xs: "13px", sm: "14px" },
                textDecoration: "underline",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Voltar para o login
            </Link>
          </Box>
        </Box>
      )}
    </AuthLayout>
  );
}

export default function MedicoPasswordResetPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MedicoPasswordResetContent />
    </Suspense>
  );
}
