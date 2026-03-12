/**
 * AuthLayout Component
 * 
 * Reusable layout for authentication pages (login, first-access, password-reset)
 * Provides consistent branding section and form container
 */

'use client';

import { ReactNode } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTenantAssets } from '@/shared/context/TenantThemeProvider';
import DynamicSVG, { DynamicStrokeElement } from '@/shared/components/DynamicSVG';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { assets, isLoading } = useTenantAssets();

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress sx={{ color: 'primary.main' }} />
        <Typography sx={{ color: 'grey.800' }}>Carregando</Typography>
      </Box>
    );
  }

  // Check if there's a custom background pattern
  const hasCustomBackground = !!assets.loginBackground;

  // Mobile layout - full screen background with centered form
  if (isMobile) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: 'secondary.main',
          backgroundImage: hasCustomBackground ? `url(${assets.loginBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Form container with semi-transparent background */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '400px',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            p: { xs: 3, sm: 4 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Title and subtitle */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: 1.5,
                color: 'grey.700',
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          {children}
        </Box>
      </Box>
    );
  }

  // Desktop layout - side by side
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      {/* LEFT SIDE - BRANDING */}
      <Box
        sx={{
          width: '648px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.light',
          backgroundImage: hasCustomBackground ? `url(${assets.loginBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'left bottom',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Decorative patterns - show only if no custom background */}
        {!hasCustomBackground && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: -128,
                right: -168,
                width: 384,
                height: 384,
              }}
            >
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
            </Box>

            <Box
              sx={{
                position: 'absolute',
                bottom: -144,
                left: 20,
                width: 400,
                height: 400,
              }}
            >
              <DynamicSVG width="519" height="83" viewBox="0 0 519 83" className="w-full h-full">
                <DynamicStrokeElement stroke={theme.palette.secondary.main}>
                  <circle cx="235.739" cy="283.184" r="280.582" />
                </DynamicStrokeElement>
              </DynamicSVG>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                bottom: -100,
                left: -100,
                width: 400,
                height: 400,
              }}
            >
              <DynamicSVG width="203" height="338" viewBox="0 0 203 338" className="w-full h-full">
                <DynamicStrokeElement stroke={theme.palette.secondary.main}>
                  <circle cx="-44.3434" cy="246.657" r="244.657" />
                </DynamicStrokeElement>
              </DynamicSVG>
            </Box>
          </>
        )}
      </Box>

      {/* RIGHT SIDE - FORM */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 8,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '480px' }}>
          <Box
            sx={{
              textAlign: 'center',
              mb: 6,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '363px',
                gap: 2,
                mt: 4,
              }}
            >
              <Typography
                component="h1"
                sx={{
                  fontSize: '2.25rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textAlign: 'center',
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.125rem',
                  lineHeight: 1.5,
                  textAlign: 'center',
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Box>

          {children}
        </Box>
      </Box>
    </Box>
  );
}
