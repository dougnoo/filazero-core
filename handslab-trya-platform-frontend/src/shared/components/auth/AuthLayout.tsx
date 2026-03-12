/**
 * AuthLayout Component
 * 
 * Reusable layout for authentication pages (login, first-access, password-reset)
 * Provides consistent branding section and form container
 */

'use client';

import { ReactNode, useMemo } from 'react';
import { useGlobalThemeContext } from '@/shared/context/GlobalThemeContext';
import DynamicSVG, { DynamicStrokeElement } from '@/shared/components/DynamicSVG';
import { ROLE_OVERRIDES, RoleEnum } from '@/shared/role';
import { deepMerge } from '@/shared/theme/mergeRole';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  role?: RoleEnum;
}

export default function AuthLayout({ children, title, subtitle, role = RoleEnum.Paciente }: AuthLayoutProps) {
  const { theme, isLoading } = useGlobalThemeContext();
  
  const themed = useMemo(() => {
    if (!theme || !theme.colors || !theme.colors.button) {
      return theme;
    }
    return deepMerge(theme, ROLE_OVERRIDES[role]);
  }, [theme, role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Carregando</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE - BRANDING */}
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
        {/* Logo do Tenant - mostrar sempre sobre o fundo */}
        {themed?.images?.logo && (
          <div className="relative z-10 flex items-center justify-center">
            <img 
              src={themed.images.logo} 
              alt={themed?.name || 'Logo'} 
              className="max-w-[280px] max-h-[120px] object-contain"
            />
          </div>
        )}
        
        {/* Padrões decorativos - mostrar apenas se não tiver backgroundPattern customizado */}
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

      {/* RIGHT SIDE - FORM */}
      <div
        className="w-full lg:w-2/3 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-8 lg:py-0"
        style={{ backgroundColor: themed?.colors?.background || '#FFFFFF' }}
      >
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-8 lg:mb-12 flex justify-center">
            <div
              className="flex flex-col items-center justify-center"
              style={{ width: "363px", height: "96px", gap: "16px", marginTop: "32px" }}
            >
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight"
                style={{
                  color: themed?.colors?.text?.primary || "#041616",
                  fontSize: themed?.typography?.heading?.fontSize || '2rem',
                  fontWeight: themed?.typography?.heading?.fontWeight || 700,
                  fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                  textAlign: "center",
                }}
              >
                {title}
              </h1>
              <p
                className="text-base sm:text-lg leading-6"
                style={{
                  color: themed?.colors?.text?.primary || "#041616",
                  fontSize: themed?.typography?.body?.fontSize || '1rem',
                  fontWeight: themed?.typography?.body?.fontWeight || 400,
                  fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                  textAlign: "center",
                }}
              >
                {subtitle}
              </p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
