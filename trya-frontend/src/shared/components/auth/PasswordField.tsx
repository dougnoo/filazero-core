/**
 * PasswordField Component
 * 
 * Reusable password field with show/hide toggle
 */

'use client';

import { useState } from 'react';
import { InputAdornment, IconButton } from '@mui/material';
import AuthTextField from './AuthTextField';
import { DynamicIcon } from '@/shared/components/DynamicSVG';

interface PasswordFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  autoComplete?: string;
}

export default function PasswordField({ 
  name, 
  value, 
  onChange, 
  label, 
  required = false,
  error = false,
  helperText = '',
  autoComplete = 'current-password',
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

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
      autoComplete={autoComplete}
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
                  />
                ) : (
                  <DynamicIcon 
                    iconType="password-show" 
                    width={18} 
                    height={18} 
                    className="sm:w-5 sm:h-5"
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
