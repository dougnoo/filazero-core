'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextField, InputAdornment, IconButton, Button, Link, Box, Alert, Snackbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PageLoading from '@/shared/components/PageLoading';
import { useTenantAssets } from '@/shared/context/TenantThemeProvider';
import { authService } from '@/shared/services/authService';
import DynamicSVG, { DynamicStrokeElement, DynamicIcon } from '@/shared/components/DynamicSVG';
import { getRouteByRole } from '@/shared/utils/roleRedirect';

function NewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { assets, isLoading } = useTenantAssets();
  
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
            // Busca o perfil para obter a role e status de onboarding
            const userProfile = await authService.getUserProfile();
            const role = userProfile.role;
            
            // Verifica se é paciente usando a mesma lógica da página raiz
            const route = getRouteByRole(role);
            
            // Se for paciente e não completou onboarding, vai para onboarding
            if (route === '/paciente' && !userProfile.onboardedAt) {
              router.push("/paciente/onboarding/location");
              return;
            }
            
            // Se não precisa de onboarding, vai para a raiz
            router.push('/');
          } catch {
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
          backgroundColor: theme.palette.primary.light,
          backgroundImage: assets.loginBackground ? `url(${assets.loginBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: "left bottom",
          backgroundRepeat: 'no-repeat',
          minHeight: "30vh"
        }}
      >
        {!assets.loginBackground && <>
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
                <circle cx="268" cy="268" r="268" fill={theme.palette.primary.main} />
              </mask>
              <g mask="url(#mask0_4432_759)">
                <circle cx="267.571" cy="267.573" r="267.571" fill={theme.palette.secondary.main} />
                <DynamicStrokeElement stroke={theme.palette.primary.main}>
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
              <DynamicStrokeElement stroke={theme.palette.secondary.main}>
                <circle cx="235.739" cy="283.184" r="280.582" />
              </DynamicStrokeElement>
            </DynamicSVG>
          </div>

          <div className="absolute -bottom-25 -left-25 w-100 h-100 hidden lg:block">
            <DynamicSVG width="203" height="338" viewBox="0 0 203 338" className="w-full h-full">
              <DynamicStrokeElement stroke={theme.palette.secondary.main}>
                <circle cx="-44.3434" cy="246.657" r="244.657" />
              </DynamicStrokeElement>
            </DynamicSVG>
          </div>
        </>}

      </div>

      <div 
        className="w-full lg:w-2/3 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-8 lg:py-0"
        style={{ backgroundColor: theme.palette.background.paper }}
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
                  color: theme.palette.text.primary,
                   
                  textAlign: 'center',
                }}
              >
                {title}
              </h1>
              <p 
                className="text-base sm:text-lg leading-6"
                style={{ 
                  color: theme.palette.text.primary,
                   
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
                        sx={{ color: 'grey.800' }}
                      >
                        {showPassword ? (
                          <DynamicIcon
                            iconType="password-hide"
                            width={18}
                            height={18}
                            className="sm:w-5 sm:h-5"
                            color={theme.palette.text.secondary}
                          />
                        ) : (
                          <DynamicIcon
                            iconType="password-show"
                            width={18}
                            height={18}
                            className="sm:w-5 sm:h-5"
                            color={theme.palette.text.secondary}
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
                    borderColor: 'divider',
                  },
                  '&:hover fieldset': {
                    bordercolor: 'grey.800',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'text.primary',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'grey.800',
                  fontSize: { xs: '14px', sm: '16px' },
                   
                  '&.Mui-focused': {
                    color: 'text.primary',
                  },
                },
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                  fontSize: { xs: '16px', sm: '17px', md: '18px' },
                   
                  '&::placeholder': {
                    color: 'text.primary',
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
                        sx={{ color: 'grey.800' }}
                      >
                        {showConfirmPassword ? (
                          <DynamicIcon
                            iconType="password-hide"
                            width={18}
                            height={18}
                            className="sm:w-5 sm:h-5"
                            color={theme.palette.text.secondary}
                          />
                        ) : (
                          <DynamicIcon
                            iconType="password-show"
                            width={18}
                            height={18}
                            className="sm:w-5 sm:h-5"
                            color={theme.palette.text.secondary}
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
                    borderColor: 'divider',
                  },
                  '&:hover fieldset': {
                    bordercolor: 'grey.800',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'text.primary',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'grey.800',
                  fontSize: { xs: '14px', sm: '16px' },
                   
                  '&.Mui-focused': {
                    color: 'text.primary',
                  },
                },
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                  fontSize: { xs: '16px', sm: '17px', md: '18px' },
                   
                  '&::placeholder': {
                    color: 'text.primary',
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
              color="primary"
              disabled={isLoadingUpdate || !isFormValid}
              sx={{
                height: { xs: '48px', sm: '52px', md: '56px' },
                fontSize: { xs: '16px', sm: '17px', md: '18px' },
                fontWeight: 600,
                 
                borderRadius: '8px',
                textTransform: 'none',
                ...(!isFormValid && {
                  bgcolor: 'grey.300',
                  color: 'grey.800',
                  '&:hover': {
                    bgcolor: 'grey.300',
                  },
                }),
                '&.Mui-disabled': {
                  bgcolor: 'grey.300',
                  color: 'grey.800',
                },
              }}
            >
              {isLoadingUpdate ? 'Atualizando...' : 'Atualizar senha'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Link
                href={`/login`}
                sx={{
                  color: 'text.primary',
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
                      stroke={theme.palette.text.primary} 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M6.85712 6L0.857117 12L6.85712 18" 
                      stroke={theme.palette.text.primary} 
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
