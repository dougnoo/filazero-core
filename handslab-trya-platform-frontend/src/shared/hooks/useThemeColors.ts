'use client';

import { useTheme } from './useTheme';
import { getLightPrimaryColor, getLightPrimarySolid, getPrimaryColorWithOpacity } from '../theme';

/**
 * Hook que retorna as cores do tema dinâmico do tenant com cores derivadas calculadas
 */
export function useThemeColors() {
  const { theme: dynamicTheme, isLoading } = useTheme();
  
  // Usa a cor primária do tema dinâmico ou fallback
  const primaryColor = dynamicTheme?.colors?.primary || dynamicTheme?.colors?.button?.primary || '#BEE1EB';
  
  // Calcula cores derivadas da cor primária
  const lightPrimary = getLightPrimarySolid(primaryColor);
  const lightPrimaryWithOpacity = getLightPrimaryColor(primaryColor, 0.40);
  const chipBackground = dynamicTheme?.id === 'default' ? getPrimaryColorWithOpacity(primaryColor, 0.30) : getLightPrimaryColor(primaryColor, 0.30);;
  
  return {
    // Cores do tema dinâmico
    primary: primaryColor,
    secondary: dynamicTheme?.colors?.secondary || '#041616',
    textDark: dynamicTheme?.colors?.text?.primary || '#041616',
    textMuted: dynamicTheme?.colors?.text?.secondary || '#041616',
    
    // Cores de fundo
    background: dynamicTheme?.colors?.background || '#F5F5F5',
    cardBackground: dynamicTheme?.colors?.surface || '#FFFFFF',
    
    // Cores de botões
    buttonText: dynamicTheme?.colors?.button?.text || '#FFFFFF',
    
    // Cores derivadas da primária
    softBorder: lightPrimary,
    avatarBackground: lightPrimary,
    iconBackground: lightPrimary,
    backgroundSoft: lightPrimaryWithOpacity,
    chipBackground: chipBackground,
    
    // Cores fixas
    white: '#FFFFFF',
    secondaryHover: '#f8f8f8',
    success: '#041616',
    successBackground: '#BCDF844D',
    successSoft: '#BCDF84',
    successSoftBackground: '#BCDF844D',
    
    // Tipografia
    fontFamily: dynamicTheme?.typography?.fontFamily || 'Chivo, sans-serif',
    
    isLoading,
  };
}

