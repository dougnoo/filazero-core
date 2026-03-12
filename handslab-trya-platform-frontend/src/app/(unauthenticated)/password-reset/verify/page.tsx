'use client';

import { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Link, Box, Alert, Snackbar } from '@mui/material';
import PageLoading from '@/shared/components/PageLoading';

interface NewPasswordError extends Error {
  isNewPasswordRequired: boolean;
}
import { useGlobalThemeContext } from '@/shared/context/GlobalThemeContext';
import { authService } from '@/shared/services/authService';
import DynamicSVG, { DynamicStrokeElement } from '@/shared/components/DynamicSVG';
import { ROLE_OVERRIDES, RoleEnum } from '@/shared/role';
import { deepMerge } from '@/shared/theme/mergeRole';

function PasswordResetVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, isLoading } = useGlobalThemeContext();
  
  // Usa Paciente como role padrão para o tema
  const resolvedRole = RoleEnum.Paciente;
  
  // Merge tema tenant + override por perfil
  const themed = useMemo(() => {
    if (!theme || !theme.colors || !theme.colors.button) {
      return theme;
    }
    return deepMerge(theme, ROLE_OVERRIDES[resolvedRole]);
  }, [theme, resolvedRole]);
  
  const title = 'Verifique o código recebido';
  const subtitle = 'Digite o código de verificação enviado para o e-mail';
  
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationType, setVerificationType] = useState<'password-reset' | 'new-password'>('password-reset');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState('');
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const newPasswordData = sessionStorage.getItem('newPasswordData');
    
    if (newPasswordData) {
      try {
        const data = JSON.parse(newPasswordData);
        setEmail(data.email);
        setPassword(data.password);
        setSession(data.session || '');
        setVerificationType('new-password');
        sessionStorage.removeItem('newPasswordData');
        return;
      } catch (error) {
        // Erro ao parsear dados do sessionStorage
      }
    }
    
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type');
    
    if (emailParam) {
      try {
        setEmail(decodeURIComponent(emailParam));
      } catch {
        setEmail(emailParam);
      }
      
      if (typeParam === 'new-password') {
        setVerificationType('new-password');
      } else {
        setVerificationType('password-reset');
      }
    } else {
      router.push(`/login`);
    }
  }, [searchParams, router]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...verificationCode];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    
    setVerificationCode(newCode);
    
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    const nextInput = document.getElementById(`code-${lastFilledIndex}`);
    nextInput?.focus();
  };

  const isCodeComplete = verificationCode.every(digit => digit !== '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!isCodeComplete) {
      setError('Por favor, digite o código completo de 6 dígitos');
      return;
    }

    setIsLoadingVerify(true);

    try {
      const code = verificationCode.join('');
      
      if (verificationType === 'new-password') {
        await authService.verifyOtpForNewPassword({ 
          email, 
          otpCode: code, 
          expectedType: 'FIRST_LOGIN' 
        });
        
        setSuccess('Código verificado com sucesso! Redirecionando...');
        
        setTimeout(() => {
          const newPasswordParams = new URLSearchParams({
            email: email,
            code: code,
            session: session
          });
          router.push(`/password-reset/new-password?${newPasswordParams.toString()}`);
        }, 1500);
      } else {
        setSuccess('Código verificado com sucesso! Redirecionando...');
        
        setTimeout(() => {
          router.push(`/password-reset/new-password?email=${encodeURIComponent(email)}&code=${code}&type=password-reset`);
        }, 1500);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Código inválido. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoadingVerify(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    
    try {
      if (verificationType === 'new-password') {
        if (!password) {
          setError('Senha não encontrada. Tente fazer login novamente.');
          return;
        }
        
        await authService.login({ email, password });
        
        setError('Novo código enviado com sucesso!');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      await authService.forgotPassword({ email });
      
      setError(null);
      const tempError = error;
      setError('Código reenviado com sucesso!');
      setTimeout(() => setError(tempError), 3000);
      
    } catch (err) {
      if (err instanceof Error && 'isNewPasswordRequired' in err && (err as NewPasswordError).isNewPasswordRequired) {
        setError('Novo código enviado com sucesso!');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reenviar código';
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div
        className="w-full lg:w-[648px] relative overflow-hidden flex items-center justify-center py-8 lg:py-0"
        style={{ 
          backgroundColor: themed?.colors?.backgroundSecondary || '#F8F5F0',
          backgroundImage: themed.images.backgroundPattern ? `url(${themed.images.backgroundPattern})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: "left bottom",
          backgroundRepeat: 'no-repeat',
          minHeight: "30vh"
        }}
      >
        {!themed.images.backgroundPattern && <>
          <div className="absolute -top-32 -right-42 w-96 h-96 hidden lg:block">
            <DynamicSVG width="536" height="536" viewBox="0 0 536 536" className="w-full h-full">
              <mask
                id="mask0_4432_759"
                style={{ maskType: "alpha" } as React.CSSProperties}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="536"
                height="536"
              >
                <circle cx="268" cy="268" r="268" fill={themed?.colors?.primary || '#BEE1EB'} />
              </mask>
              <g mask="url(#mask0_4432_759)">
                <circle cx="267.571" cy="267.573" r="267.571" fill={themed?.colors?.secondary || '#041616'} />
                <DynamicStrokeElement stroke={themed?.colors?.primary || '#BEE1EB'}>
                  <circle cx="139.883" cy="650.133" r="280.082" />
                  <circle cx="-140.199" cy="358.606" r="244.157" />
                  <circle cx="372.434" cy="-0.477142" r="163.566" />
                  <circle cx="469.715" cy="163.566" r="163.566" />
                </DynamicStrokeElement>
              </g>
            </DynamicSVG>
          </div>

          <div className="absolute -bottom-36 left-5 w-100 h-100 hidden lg:block">
            <DynamicSVG width="519" height="83" viewBox="0 0 519 83" className="w-full h-full">
              <DynamicStrokeElement stroke={themed?.colors?.secondary || '#041616'}>
                <circle cx="235.739" cy="283.184" r="280.582" />
              </DynamicStrokeElement>
            </DynamicSVG>
          </div>

          <div className="absolute -bottom-25 -left-25 w-100 h-100 hidden lg:block">
            <DynamicSVG width="203" height="338" viewBox="0 0 203 338" className="w-full h-full">
              <DynamicStrokeElement stroke={themed?.colors?.secondary || '#041616'}>
                <circle cx="-44.3434" cy="246.657" r="244.657" />
              </DynamicStrokeElement>
            </DynamicSVG>
          </div>
        </>}

      </div>

      <div 
        className="w-full lg:w-2/3 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-8 lg:py-0"
        style={{ backgroundColor: themed?.colors?.background || '#FFFFFF' }}
      >
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-8 lg:mb-12 flex justify-center">
            <div 
              className="flex flex-col items-center justify-center"
              style={{
                width: '463px',
                height: '96px',
                gap: '16px',
                marginTop: '32px',
                marginBottom: '32px'
              }}
            >
              <h1 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight"
                style={{ 
                  color: themed?.colors?.text?.primary || '#041616',
                  fontSize: themed.typography.heading.fontSize,
                  fontWeight: themed.typography.heading.fontWeight,
                  fontFamily: 'var(--font-chivo), Inter, system-ui, sans-serif',
                  textAlign: 'center',
                }}
              >
                {title}
              </h1>
              <div className="text-center">
                <p 
                  className="text-base sm:text-lg leading-6 mb-2"
                  style={{ 
                    color: themed?.colors?.text?.primary || '#041616',
                    fontSize: themed.typography.body.fontSize,
                    fontWeight: themed.typography.body.fontWeight,
                    fontFamily: 'var(--font-chivo), Inter, system-ui, sans-serif',
                    textAlign: 'center',
                  }}
                >
                  {subtitle}
                </p>
                <p 
                  className="text-base font-medium underline"
                  style={{ 
                    color: themed?.colors?.text?.primary || '#041616',
                    fontSize: themed.typography.body.fontSize,
                    fontFamily: 'var(--font-chivo), Inter, system-ui, sans-serif',
                    textAlign: 'center',
                  }}
                >
                  {email}
                </p>
              </div>
            </div>
          </div>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3}}>
            <Box 
              sx={{ 
                position: 'relative',
                display: 'flex',
                border: `1px solid ${themed?.colors?.border?.default || '#D1D5DB'}`,
                borderRadius: '8px',
                height: { xs: '48px', sm: '52px', md: '56px' },
                '&:hover': {
                  borderColor: themed?.colors?.border?.hover || '#9CA3AF',
                },
                '&:focus-within': {
                  borderColor: themed?.colors?.border?.focus || '#041616',
                  borderWidth: '2px',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '-8px',
                  left: '12px',
                  backgroundColor: themed?.colors?.background || '#FFFFFF',
                  padding: '0 4px',
                  fontSize: '12px',
                  color: themed?.colors?.text?.primary || '#041616',
                  fontFamily: 'var(--font-chivo), Inter, system-ui, sans-serif',
                  zIndex: 1,
                }}
              >
                Código de verificação<span style={{ color: '#ef4444' }}>*</span>
              </Box>
              
              {verificationCode.map((digit, index) => (
                <Box key={index} sx={{ position: 'relative', flex: 1 }}>
                  <input
                    id={`code-${index}`}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    maxLength={1}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      outline: 'none',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontFamily: 'var(--font-chivo), Inter, system-ui, sans-serif',
                      fontWeight: '600',
                      letterSpacing: '0.1em',
                      color: themed?.colors?.text?.primary || '#041616',
                      backgroundColor: 'transparent',
                    }}
                  />
                  {index < 5 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '1px',
                        height: '100%',
                        backgroundColor: '#D4DEDE',
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoadingVerify || !isCodeComplete}
              sx={{
                height: { xs: '48px', sm: '52px', md: '56px' },
                backgroundColor: isCodeComplete ? themed?.colors?.button?.primary || '#FAB900' : themed?.colors?.border?.default || '#D1D5DB',
                color: isCodeComplete ? themed?.colors?.button?.text || '#2F3237' : themed?.colors?.text?.secondary || '#4A6060',
                fontSize: { xs: '16px', sm: '17px', md: '18px' },
                fontWeight: 600,
                fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                marginTop: '32px',
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: isCodeComplete ? (themed?.colors?.button?.primaryHover || themed?.colors?.button?.primary || '#FAB900') : (themed?.colors?.border?.hover || themed?.colors?.border?.default || '#D1D5DB'),
                },
                '&:disabled': {
                  backgroundColor: themed?.colors?.border?.default || '#D1D5DB',
                  color: themed?.colors?.text?.secondary || '#4A6060',
                  cursor: 'not-allowed',
                },
              }}
            >
              {isLoadingVerify ? 'Verificando...' : 'Verificar código'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <p 
                className="text-sm mb-2"
                style={{ 
                  color: themed?.colors?.text?.secondary || '#4A6060',
                  fontSize: '14px',
                  fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                }}
              >
                Não recebeu o código?
              </p>
              <p 
                className="text-sm"
                style={{ 
                  color: themed?.colors?.text?.secondary || '#4A6060',
                  fontSize: '14px',
                  fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                }}
              >
                Verifique sua caixa de spam ou{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="font-bold underline hover:no-underline cursor-pointer"
                  style={{ 
                    color: themed?.colors?.border?.focus || '#041616',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                  }}
                >
                  solicite um novo
                </button>
              </p>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Link
                href={`/login`}
                sx={{
                  color: themed?.colors?.text?.primary || '#041616',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  fontWeight: 400,
                  lineHeight: '26px',
                  letterSpacing: '0%',
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
                    textDecorationStyle: 'solid',
                    textUnderlineOffset: '24%',
                    textDecorationThickness: 'auto',
                  },
                  '&:hover .text': {
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
                  style={{ textDecoration: 'none' }}
                >
                  <g clipPath="url(#clip0_4626_5100)">
                    <path 
                      d="M23.1428 12H0.857117" 
                      stroke={themed?.colors?.text?.primary || "#041616"} 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M6.85712 6L0.857117 12L6.85712 18" 
                      stroke={themed?.colors?.text?.primary || "#041616"} 
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
        </div>
      </div>

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
        autoHideDuration={2000}
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
    </div>
  );
}

export default function PasswordResetVerifyPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PasswordResetVerifyContent />
    </Suspense>
  );
}
