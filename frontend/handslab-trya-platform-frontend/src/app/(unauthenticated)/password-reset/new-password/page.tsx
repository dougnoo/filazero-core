'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextField, InputAdornment, IconButton, Button, Link, Box, Alert, Snackbar } from '@mui/material';
import PageLoading from '@/shared/components/PageLoading';
import { useGlobalThemeContext } from '@/shared/context/GlobalThemeContext';
import { authService } from '@/shared/services/authService';
import DynamicSVG, { DynamicStrokeElement, DynamicIcon } from '@/shared/components/DynamicSVG';
import { ROLE_OVERRIDES, RoleEnum } from '@/shared/role';
import { deepMerge } from '@/shared/theme/mergeRole';
import { getRouteByRole } from '@/shared/utils/roleRedirect';

function NewPasswordContent() {
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
  
  const title = 'Redefina uma nova senha';
  const subtitle = 'Digite e confirme uma nova senha.';
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [session, setSession] = useState('');
  const [resetType, setResetType] = useState<'new-password' | 'password-reset'>('new-password');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const codeParam = searchParams.get('code');
    const sessionParam = searchParams.get('session');
    const typeParam = searchParams.get('type');
    
    if (emailParam && codeParam) {
      setEmail(decodeURIComponent(emailParam));
      setCode(codeParam);
      
      if (typeParam === 'password-reset') {
        setResetType('password-reset');
      } else {
        setResetType('new-password');
      }
      
      if (sessionParam) {
        const decodedSession = decodeURIComponent(sessionParam);
        setSession(decodedSession);
      }
    } else {
      router.push(`/password-reset`);
    }
  }, [searchParams, router]);

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;
    
    return {
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      hasMinLength,
      isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && hasMinLength
    };
  };

  const passwordValidation = validatePassword(formData.password);
  const isPasswordValid = formData.password.trim() !== '' && passwordValidation.isValid;
  const isConfirmPasswordValid = formData.confirmPassword.trim() !== '' && formData.confirmPassword === formData.password;
  const isFormValid = isPasswordValid && isConfirmPasswordValid;

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
    setSuccess(null);
    
    if (!formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Nova senha deve conter: letra maiúscula, minúscula, número e caractere especial');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoadingUpdate(true);

    try {
      if (resetType === 'new-password') {
        await authService.completeNewPassword({
          email,
          newPassword: formData.password,
          otpCode: code,
          session: session
        });
      } else {
        await authService.resetPassword({
          email,
          verificationCode: code,
          newPassword: formData.password
        });
      }
      
      setSuccess('Senha atualizada com sucesso! Redirecionando...');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar senha';
      setError(errorMessage);
    } finally {
       // Se for new-password (primeiro acesso), verifica se precisa ir para onboarding
       if (resetType === 'new-password') {
    setTimeout(async () => {
          try {
            // Verifica se é primeiro acesso usando a flag do localStorage
            const isFirstLogin = localStorage.getItem("user_is_first_login") === "true";
            
            // Busca o perfil para obter a role
            const userProfile = await authService.getUserProfile();
            const role = userProfile.role;
            
            // Verifica se é paciente usando a mesma lógica da página raiz
            const route = getRouteByRole(role);
            
            // Se for paciente e primeiro acesso, vai para onboarding
            if (route === '/paciente' && isFirstLogin) {
              // Verifica o onboarding de localização
              const hasCompletedOnboarding = localStorage.getItem('paciente_location_onboarding_completed');
              
              if (hasCompletedOnboarding !== "true") {
                router.push("/paciente/onboarding/location");
                return;
              }

              // Verifica o aceite de política de privacidade
              const hasAcceptedPrivacy = localStorage.getItem("paciente_privacy_acceptance_completed");
              
              if (hasAcceptedPrivacy !== "true") {
                router.push("/paciente/onboarding/privacy-acceptance");
                return;
              }

              // Verifica se já completou a triagem
              const hasCompletedTriagem = localStorage.getItem("paciente_triagem_final_completed");
              
              if (hasCompletedTriagem !== "true") {
                const hasCompletedIntro = localStorage.getItem("paciente_triagem_intro_completed");
                if (hasCompletedIntro !== "true") {
                  router.push("/paciente/onboarding/triagem-intro");
                  return;
                } else {
                  const step1 = localStorage.getItem("paciente_triagem_step1_completed");
                  const step2 = localStorage.getItem("paciente_triagem_step2_completed");
                  const step3 = localStorage.getItem("paciente_triagem_step3_completed");
                  
                  if (step1 !== "true") {
                    router.push("/paciente/onboarding/triagem/step1");
                    return;
                  } else if (step2 !== "true") {
                    router.push("/paciente/onboarding/triagem/step2");
                    return;
                  } else if (step3 !== "true") {
                    router.push("/paciente/onboarding/triagem/step3");
                    return;
                  } else {
                    router.push("/paciente/onboarding/triagem/final");
                    return;
                  }
                }
              }
            }
            
            // Se não for primeiro acesso ou não for paciente, vai para a raiz
            router.push('/');
          } catch (error) {
            router.push('/');
          }
        }, 2000);
      } else {
      // Se for password-reset normal, redireciona para login
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
    
      setIsLoadingUpdate(false);
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
                marginTop: '32px'
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
              <p 
                className="text-base sm:text-lg leading-6"
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
            </div>
          </div>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder=""
              label="Nova senha"
              required
              error={formData.password.trim() !== '' && !isPasswordValid}
              helperText={
                formData.password.trim() !== '' && !isPasswordValid 
                  ? 'Nova senha deve conter: letra maiúscula, minúscula, número e caractere especial'
                  : ''
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end" className="pr-2">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: themed?.colors?.text?.secondary || '#4A6060' }}
                      >
                        {showPassword ? (
                          <DynamicIcon
                            iconType="password-hide"
                            width={18}
                            height={18}
                            className="sm:w-5 sm:h-5"
                            color={themed?.colors?.text?.secondary || '#4A6060'}
                          />
                        ) : (
                          <DynamicIcon
                            iconType="password-show"
                            width={18}
                            height={18}
                            className="sm:w-5 sm:h-5"
                            color={themed?.colors?.text?.secondary || '#4A6060'}
                          />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: { xs: '48px', sm: '52px', md: '56px' },
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: themed?.colors?.border?.default || '#D1D5DB',
                  },
                  '&:hover fieldset': {
                    borderColor: themed?.colors?.border?.hover || '#9CA3AF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themed?.colors?.border?.focus || '#041616',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themed?.colors?.text?.secondary || '#4A6060',
                  fontSize: { xs: '14px', sm: '16px' },
                  fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                  '&.Mui-focused': {
                    color: themed?.colors?.border?.focus || '#041616',
                  },
                },
                '& .MuiInputBase-input': {
                  color: themed?.colors?.text?.primary || '#041616',
                  fontSize: { xs: '16px', sm: '17px', md: '18px' },
                  fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                  '&::placeholder': {
                    color: themed?.colors?.text?.primary || '#041616',
                    opacity: 1,
                  },
                },
                '& .MuiFormLabel-asterisk': {
                  color: '#ef4444',
                },
              }}
            />

            <TextField
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder=""
              label="Confirme sua nova senha"
              required
              error={formData.confirmPassword.trim() !== '' && !isConfirmPasswordValid}
              helperText={formData.confirmPassword.trim() !== '' && !isConfirmPasswordValid ? 'As senhas não coincidem' : ''}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end" className="pr-2">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: themed?.colors?.text?.secondary || '#4A6060' }}
                      >
                        {showConfirmPassword ? (
                          <DynamicIcon
                            iconType="password-hide"
                            width={18}
                            height={18}
                            className="sm:w-5 sm:h-5"
                            color={themed?.colors?.text?.secondary || '#4A6060'}
                          />
                        ) : (
                          <DynamicIcon
                            iconType="password-show"
                            width={18}
                            height={18}
                            className="sm:w-5 sm:h-5"
                            color={themed?.colors?.text?.secondary || '#4A6060'}
                          />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: { xs: '48px', sm: '52px', md: '56px' },
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: themed?.colors?.border?.default || '#D1D5DB',
                  },
                  '&:hover fieldset': {
                    borderColor: themed?.colors?.border?.hover || '#9CA3AF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themed?.colors?.border?.focus || '#041616',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themed?.colors?.text?.secondary || '#4A6060',
                  fontSize: { xs: '14px', sm: '16px' },
                  fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                  '&.Mui-focused': {
                    color: themed?.colors?.border?.focus || '#041616',
                  },
                },
                '& .MuiInputBase-input': {
                  color: themed?.colors?.text?.primary || '#041616',
                  fontSize: { xs: '16px', sm: '17px', md: '18px' },
                  fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                  '&::placeholder': {
                    color: themed?.colors?.text?.primary || '#041616',
                    opacity: 1,
                  },
                },
                '& .MuiFormLabel-asterisk': {
                  color: '#ef4444',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoadingUpdate || !isFormValid}
              sx={{
                height: { xs: '48px', sm: '52px', md: '56px' },
                backgroundColor: isFormValid ? themed?.colors?.button?.primary || '#FAB900' : themed?.colors?.border?.default || '#D1D5DB',
                color: isFormValid ? themed?.colors?.button?.text || '#2F3237' : themed?.colors?.text?.secondary || '#4A6060',
                fontSize: { xs: '16px', sm: '17px', md: '18px' },
                fontWeight: 600,
                fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: isFormValid ? (themed?.colors?.button?.primaryHover || themed?.colors?.button?.primary || '#FAB900') : (themed?.colors?.border?.hover || themed?.colors?.border?.default || '#D1D5DB'),
                },
                '&:disabled': {
                  backgroundColor: themed?.colors?.border?.default || '#D1D5DB',
                  color: themed?.colors?.text?.secondary || '#4A6060',
                  cursor: 'not-allowed',
                },
              }}
            >
              {isLoadingUpdate ? 'Atualizando...' : 'Atualizar senha'}
            </Button>

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
                <span className="text">Cancelar e voltar ao login</span>
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
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewPasswordContent />
    </Suspense>
  );
}
