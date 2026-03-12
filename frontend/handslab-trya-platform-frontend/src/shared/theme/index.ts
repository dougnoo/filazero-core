// Função auxiliar para converter hex para RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Função para criar uma versão clara da cor primária
export const getLightPrimaryColor = (primary: string, opacity: number = 1): string => {
  const rgb = hexToRgb(primary);
  if (!rgb) return primary;
  
  // Cria uma versão mais clara da cor primária (mistura com branco)
  const lightR = Math.round(rgb.r + (255 - rgb.r) * 0.85);
  const lightG = Math.round(rgb.g + (255 - rgb.g) * 0.85);
  const lightB = Math.round(rgb.b + (255 - rgb.b) * 0.85);
  
  return `rgba(${lightR}, ${lightG}, ${lightB}, ${opacity})`;
};

// Função para aplicar opacidade diretamente na cor (sem clarear)
export const getPrimaryColorWithOpacity = (primary: string, opacity: number = 1): string => {
  const rgb = hexToRgb(primary);
  if (!rgb) return primary;
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

// Função para criar uma versão sólida clara da cor primária
export const getLightPrimarySolid = (primary: string): string => {
  const rgb = hexToRgb(primary);
  if (!rgb) return primary;
  
  // Cria uma versão mais clara da cor primária (mistura com branco)
  const lightR = Math.round(rgb.r + (255 - rgb.r) * 0.85);
  const lightG = Math.round(rgb.g + (255 - rgb.g) * 0.85);
  const lightB = Math.round(rgb.b + (255 - rgb.b) * 0.85);
  
  return `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
};

// Tema centralizado - pode ser customizado por cliente
// NOTA: Este tema é usado como fallback. Os componentes devem usar useTheme() para pegar o tema dinâmico do tenant
const primaryColor = "#BEE1EB";
const lightPrimary = getLightPrimarySolid(primaryColor);
const lightPrimaryWithOpacity = getLightPrimaryColor(primaryColor, 0.40);

export const theme = {
  // Cores primárias
  primary: primaryColor,
  textDark: "#041616",
  textMuted: "#4A6060",
  
  // Cores de fundo
  background: "#F5F5F5",
  appBarBackground: "white",
  cardBackground: "#FFFFFF",
  
  // Cores de borda e separação
  border: "#e0e0e0",
  softBorder: lightPrimary,
  
  // Cores de status
  success: "#041616",
  successBackground: "#BCDF844D",
  successSoft: "#BCDF84",
  successSoftBackground: "#BCDF844D",
  
  // Cores de avatar e ícones (usando cor primária clara)
  avatarBackground: lightPrimary,
  iconBackground: lightPrimary,
  
  // Cores secundárias
  secondary: "#4A4459",
  secondaryHover: "#f8f8f8",
  
  // Cores de chips (usando cor primária clara)
  chipBackground: getLightPrimaryColor(primaryColor, 0.30),
  
  // Cores de fundo suave (usando cor primária clara)
  backgroundSoft: lightPrimaryWithOpacity,
  
  // Cores neutras
  white: "#FFFFFF",
  
  // Tipografia
  fontFamily: "Chivo, sans-serif"
};

// Tipos para TypeScript
export type Theme = typeof theme;

// Hook para usar o tema (opcional, para casos mais complexos)
export const useTheme = () => theme;
