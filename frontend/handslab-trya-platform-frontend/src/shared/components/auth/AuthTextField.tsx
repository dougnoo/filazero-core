/**
 * AuthTextField Component
 * 
 * Reusable styled TextField for authentication forms
 * Applies consistent theming and validation
 */

'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { useGlobalThemeContext } from '@/shared/context/GlobalThemeContext';
import { ROLE_OVERRIDES, RoleEnum } from '@/shared/role';
import { deepMerge } from '@/shared/theme/mergeRole';
import { useMemo } from 'react';

interface AuthTextFieldProps extends Omit<TextFieldProps, 'sx'> {
  role?: RoleEnum;
}

export default function AuthTextField({ role = RoleEnum.Paciente, ...props }: AuthTextFieldProps) {
  const { theme } = useGlobalThemeContext();
  
  const themed = useMemo(() => {
    if (!theme || !theme.colors || !theme.colors.button) {
      return theme;
    }
    return deepMerge(theme, ROLE_OVERRIDES[role]);
  }, [theme, role]);

  return (
    <TextField
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: { xs: "48px", sm: "52px", md: "56px" },
          borderRadius: "8px",
          "& fieldset": { borderColor: themed?.colors?.border?.default || '#D1D5DB' },
          "&:hover fieldset": { borderColor: themed?.colors?.border?.hover || '#9CA3AF' },
          "&.Mui-focused fieldset": {
            borderColor: themed?.colors?.border?.focus || '#041616',
            borderWidth: "2px",
          },
        },
        "& .MuiInputLabel-root": {
          color: themed?.colors?.text?.primary || "#041616",
          fontSize: { xs: "14px", sm: "16px" },
          fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
          "&.Mui-focused": { color: themed?.colors?.border?.focus || '#041616' },
        },
        "& .MuiInputBase-input": {
          color: themed?.colors?.text?.primary || "#041616",
          fontSize: { xs: "16px", sm: "17px", md: "18px" },
          fontFamily: themed?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
        },
        "& .MuiFormLabel-asterisk": { color: "#ef4444" },
      }}
    />
  );
}
