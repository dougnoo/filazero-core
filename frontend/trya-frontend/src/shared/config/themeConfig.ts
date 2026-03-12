import { ClientTheme } from "../types/theme";
import { buildAssetUrl } from "../theme/createTenantTheme";

// Tema padrão da Trya (Admin)
export const defaultTheme: ClientTheme = {
  id: "default",
  name: "default",
  subdomain: "default",
  colors: {
    primary: "#BEE1EB",
    secondary: "#041616",
    background: "#FFFFFF",
    backgroundSecondary: "#BEE1EB",
    surface: "#F5F5F5",
    text: {
      primary: "#041616",
      secondary: "#041616",
      disabled: "#9CA3AF",
    },
    border: {
      default: "#D1D5DB",
      hover: "#9CA3AF",
      focus: "#041616",
    },
    button: {
      primary: "#041616",
      primaryHover: "#030F0F",
      text: "#FFFFFF",
    },
  },
  images: {
    logo: buildAssetUrl('theme/logo.png'),
    backgroundPattern: buildAssetUrl('theme/paciente/login-background.png'),
  },
  typography: {
    fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
    heading: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    body: {
      fontSize: "1rem",
      fontWeight: 400,
    },
    caption: {
      fontSize: "0.875rem",
      fontWeight: 400,
    },
  },
  layout: {
    logoPosition: "center",
    showPoweredBy: false, // Tema padrão da Trya não mostra "Powered by"
    poweredByText: "Powered by Trya",
  },
};

// Tema específico para médicos
export const medicoTheme: ClientTheme = {
  id: "medico",
  name: "medico",
  subdomain: "medico",
  colors: {
    primary: "#0A3A3A",
    secondary: "#E4B4C6",
    background: "#F5FAFA",
    backgroundSecondary: "#D3F8F8",
    surface: "#F5F5F5",
    text: {
      primary: "#041616",
      secondary: "#041616",
      disabled: "#9CA3AF",
    },
    border: {
      default: "#D1D5DB",
      hover: "#9CA3AF",
      focus: "#041616",
    },
    button: {
      primary: "#041616",
      primaryHover: "#030F0F",
      text: "#FFFFFF",
    },
  },
  images: {
    logo: buildAssetUrl('theme/logo.png'),
    backgroundPattern: buildAssetUrl('theme/medico/login-background.png'),
  },
  typography: {
    fontFamily: "var(--font-chivo), Inter, system-ui, sans-serif",
    heading: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    body: {
      fontSize: "1rem",
      fontWeight: 400,
    },
    caption: {
      fontSize: "0.875rem",
      fontWeight: 400,
    },
  },
  layout: {
    logoPosition: "center",
    showPoweredBy: false,
    poweredByText: "Powered by Trya",
  },
};

// Configurações do sistema
export const themeConfig = {
  cacheDuration: 5 * 60 * 1000, // 5 minutos
  cacheKey: "client_theme_v2", // v2 para invalidar cache antigo
  apiEndpoint: "/api/theme",
  publicThemeEndpoint: "/api/public/broker-theme",
  fallbackTheme: defaultTheme,
} as const;
