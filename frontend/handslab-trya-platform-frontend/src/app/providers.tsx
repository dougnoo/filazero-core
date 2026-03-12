'use client';

import { GlobalThemeProvider } from "../shared/context/GlobalThemeContext";
import ThemeProvider from "../shared/components/ThemeProvider";
import { ToastProvider } from "../shared/context/ToastContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <GlobalThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </GlobalThemeProvider>
    </ThemeProvider>
  );
}

