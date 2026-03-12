export interface ClientTheme {
  id: string;
  name: string;
  subdomain: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    backgroundSecondary: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: {
      default: string;
      hover: string;
      focus: string;
    };
    button: {
      primary: string;
      primaryHover: string;
      text: string;
    };
  };
  images: {
    logo: string;
    backgroundPattern?: string;
    favicon?: string;
    bannerDashboard?: string;
    onboardingFinalIllustration?: string;
  };
  typography: {
    fontFamily: string;
    heading: {
      fontSize: string;
      fontWeight: number;
    };
    body: {
      fontSize: string;
      fontWeight: number;
    };
    caption: {
      fontSize: string;
      fontWeight: number;
    };
  };
  layout: {
    logoPosition: 'left' | 'center' | 'right';
    showPoweredBy: boolean;
    poweredByText?: string;
  };
}

export interface ThemeConfig {
  defaultTheme: ClientTheme;
  clientThemes: Record<string, ClientTheme>;
}

export interface ThemeContextType {
  theme: ClientTheme;
  isLoading: boolean;
  error: string | null;
  refreshTheme: () => Promise<void>;
}
