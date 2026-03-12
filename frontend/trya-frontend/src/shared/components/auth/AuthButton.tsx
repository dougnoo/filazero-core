/**
 * AuthButton Component
 * 
 * Reusable styled Button for authentication forms
 * Uses MUI's native theming with automatic contrast text calculation
 */

'use client';

import { Button, ButtonProps } from '@mui/material';

interface AuthButtonProps extends ButtonProps {
  isValid?: boolean;
}

export default function AuthButton({ 
  isValid = true,
  disabled,
  sx,
  ...props 
}: AuthButtonProps) {
  const isDisabled = disabled || !isValid;

  return (
    <Button
      {...props}
      variant="contained"
      color="primary"
      size='large'
      disabled={isDisabled}
    />
  );
}
