/**
 * AuthButton Component
 * 
 * Reusable styled Button for authentication forms
 * Applies consistent theming based on form validity
 */

'use client';

import { Button, ButtonProps } from '@mui/material';
import { useGlobalThemeContext } from '@/shared/context/GlobalThemeContext';
import { ROLE_OVERRIDES, RoleEnum } from '@/shared/role';
import { deepMerge } from '@/shared/theme/mergeRole';
import { useMemo } from 'react';

interface AuthButtonProps extends ButtonProps {
  role?: RoleEnum;
  isValid?: boolean;
}

export default function AuthButton({ 
  role = RoleEnum.Paciente, 
  isValid = true,
  disabled,
  sx,
  ...props 
}: AuthButtonProps) {
  const { theme } = useGlobalThemeContext();
  
  const themed = useMemo(() => {
    if (!theme || !theme.colors || !theme.colors.button) {
      return theme;
    }
    return deepMerge(theme, ROLE_OVERRIDES[role]);
  }, [theme, role]);

  const isDisabled = disabled || !isValid;

  return (
    <Button
      {...props}
      disabled={isDisabled}
      sx={{
        ...sx,
        height: { xs: "48px", sm: "52px", md: "56px" },
        backgroundColor: isValid ? (themed?.colors?.button?.primary || '#FAB900') : (themed?.colors?.border?.default || '#D1D5DB'),
        color: isValid ? (themed?.colors?.button?.text || '#2F3237') : "#041616",
        fontSize: { xs: "16px", sm: "17px", md: "18px" },
        fontWeight: 700,
        fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
        borderRadius: "8px",
        textTransform: "none",
        "&:hover": {
          backgroundColor: isValid ? (themed?.colors?.button?.primaryHover || '#E5A800') : (themed?.colors?.border?.default || '#D1D5DB'),
        },
        "&:disabled": {
          backgroundColor: themed?.colors?.border?.default || '#D1D5DB',
          color: themed?.colors?.text?.primary || "#041616",
          cursor: "not-allowed",
        },
      }}
    />
  );
}
