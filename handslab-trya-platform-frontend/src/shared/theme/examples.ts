// Exemplos de temas customizados para diferentes clientes
import { theme as baseTheme } from './index';

// Exemplo 1: Tema para cliente Amil (azul/verde)
export const amilTheme = {
  ...baseTheme,
  primary: "#0066CC",
  textDark: "#003366",
  textMuted: "#666666",
  success: "#00AA44",
  successBackground: "#E6F7E6",
  successSoft: "#66CC99",
  avatarBackground: "#0066CC",
  iconBackground: "#E6F2FF",
  backgroundSoft: "rgba(0,102,204,0.1)",
  fontFamily: "Inter, sans-serif"
};

// Exemplo 2: Tema para cliente Unimed (laranja/vermelho)
export const unimedTheme = {
  ...baseTheme,
  primary: "#FF6600",
  textDark: "#CC3300",
  textMuted: "#666666",
  success: "#FF9900",
  successBackground: "#FFF2E6",
  successSoft: "#FFCC66",
  avatarBackground: "#FF6600",
  iconBackground: "#FFE6CC",
  backgroundSoft: "rgba(255,102,0,0.1)",
  fontFamily: "Roboto, sans-serif"
};

// Exemplo 3: Tema para cliente Bradesco (azul escuro)
export const bradescoTheme = {
  ...baseTheme,
  primary: "#1E3A8A",
  textDark: "#0F172A",
  textMuted: "#475569",
  success: "#059669",
  successBackground: "#ECFDF5",
  successSoft: "#34D399",
  avatarBackground: "#1E3A8A",
  iconBackground: "#E0E7FF",
  backgroundSoft: "rgba(30,58,138,0.1)",
  fontFamily: "Poppins, sans-serif"
};

// Exemplo 4: Tema escuro
export const darkTheme = {
  ...baseTheme,
  primary: "#60A5FA",
  textDark: "#F8FAFC",
  textMuted: "#94A3B8",
  background: "#0F172A",
  appBarBackground: "#1E293B",
  cardBackground: "#334155",
  border: "#475569",
  success: "#10B981",
  successBackground: "#064E3B",
  successSoft: "#34D399",
  avatarBackground: "#60A5FA",
  iconBackground: "#1E40AF",
  backgroundSoft: "rgba(96,165,250,0.1)",
  fontFamily: "Inter, sans-serif"
};
