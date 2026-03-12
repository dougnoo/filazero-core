'use client';

import { TenantThemeProvider } from '@/shared/context/TenantThemeProvider';
import { ToastProvider } from '@/shared/context/ToastContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ptBR } from '@mui/x-date-pickers/locales';
import 'dayjs/locale/pt-br';

const ptBRLocale = ptBR.components.MuiLocalizationProvider.defaultProps.localeText;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantThemeProvider>
      <LocalizationProvider 
        dateAdapter={AdapterDayjs} 
        adapterLocale="pt-br"
        localeText={ptBRLocale}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </LocalizationProvider>
    </TenantThemeProvider>
  );
}

