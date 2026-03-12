'use client';

import { useGlobalThemeContext } from '../context/GlobalThemeContext';

/**
 * Hook principal para acessar o tema em qualquer componente
 * 
 * Retorna:
 * - theme: Tema completo (tenant + role)
 * - currentTheme: Nome do tenant atual (ex: 'trigo', 'default')
 * - setCurrentTheme: Função para mudar o tenant
 * - isLoading: Se está carregando o tema
 * - refreshTheme: Função para atualizar o tema
 * 
 * @example
 * const { theme, currentTheme, setCurrentTheme, isLoading } = useTheme();
 * // Usar as cores do tema
 * <Button style={{ backgroundColor: theme.colors.button.primary }}>
 */
export function useTheme() {
  const context = useGlobalThemeContext();
  
  return {
    theme: context.theme,
    currentTheme: context.currentTheme,
    setCurrentTheme: context.setCurrentTheme,
    role: context.role,
    setRole: context.setRole,
    isLoading: context.isLoading,
    error: context.error,
    refreshTheme: context.refreshTheme,
  };
}
