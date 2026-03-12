/**
 * PasswordField Component
 * 
 * Reusable password field with show/hide toggle
 */

'use client';

import { useState, useMemo } from 'react';
import { InputAdornment, IconButton } from '@mui/material';
import AuthTextField from './AuthTextField';
import { DynamicIcon } from '@/shared/components/DynamicSVG';
import { RoleEnum } from '@/shared/role';
import { useGlobalThemeContext } from '@/shared/context/GlobalThemeContext';
import { ROLE_OVERRIDES } from '@/shared/role';
import { deepMerge } from '@/shared/theme/mergeRole';

interface PasswordFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  role?: RoleEnum;
}

export default function PasswordField({ 
  name, 
  value, 
  onChange, 
  label, 
  required = false,
  error = false,
  helperText = '',
  role = RoleEnum.Paciente 
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useGlobalThemeContext();
  
  const themed = useMemo(() => {
    if (!theme || !theme.colors || !theme.colors.button) {
      return theme;
    }
    return deepMerge(theme, ROLE_OVERRIDES[role]);
  }, [theme, role]);

  return (
    <AuthTextField
      fullWidth
      type={showPassword ? 'text' : 'password'}
      name={name}
      value={value}
      onChange={onChange}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      role={role}
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
    />
  );
}
