'use client';

import { Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export interface BackButtonProps {
  /**
   * Variant of the button
   * - 'icon-only': Shows only the back arrow icon
   * - 'icon-text': Shows icon with "Voltar" text
   */
  variant?: 'icon-only' | 'icon-text';
  
  /**
   * Custom click handler. If not provided, defaults to router.back()
   */
  onClick?: () => void;
  
  /**
   * Custom text to display (only for 'icon-text' variant)
   * @default "Voltar"
   */
  text?: string;
  
  /**
   * Additional className for styling
   */
  className?: string;
}

export default function BackButton({
  variant = 'icon-text',
  onClick,
  text = 'Voltar',
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  if (variant === 'icon-only') {
    return (
      <IconButton
        onClick={handleClick}
        className={className}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: '6px',
          mb: 2,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ArrowBack sx={{ fontSize: '20px' }} />
      </IconButton>
    );
  }

  return (
    <Button
      startIcon={<ArrowBack />}
      onClick={handleClick}
      className={className}
      color='inherit'
      fullWidth
      sx={{
        justifyContent: 'flex-start'
      }}
    >
      {text}
    </Button>
  );
}
