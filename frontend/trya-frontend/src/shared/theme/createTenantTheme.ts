import { createTheme, lighten, Theme, ThemeOptions } from '@mui/material/styles';

// ============================================================================
// S3 ASSETS CONFIGURATION
// Assets are served from S3 buckets, not from /public folder
// ============================================================================

/**
 * Get the S3 assets base URL for the current environment
 * In production, this should be set via NEXT_PUBLIC_ASSETS_S3_URL
 */
const getAssetsBaseUrl = (): string => {
  // Use environment variable if available, otherwise default to dev bucket
  return process.env.NEXT_PUBLIC_ASSETS_S3_URL || 'https://trya-assets-dev.s3.us-east-1.amazonaws.com';
};

/**
 * Build a full S3 asset URL
 */
export const buildAssetUrl = (path: string): string => {
  const base = getAssetsBaseUrl();
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

/**
 * Tenant theme configuration using ONLY native MUI palette tokens
 * No custom extensions - everything maps to official MUI structure
 * 
 * MUI automatically calculates:
 * - palette.primary.light (lighter version of main)
 * - palette.primary.dark (darker version of main)
 * - palette.primary.contrastText (calculated to contrast with main)
 * - Same for secondary
 */
export interface TenantThemeConfig {
  palette: {
    primary: string;           // maps to palette.primary.main
    secondary: string;         // maps to palette.secondary.main
    background: string;        // maps to palette.background.default (e.g., #F5FAFA)
    paper: string;             // maps to palette.background.paper (e.g., #FFFFFF)
    textPrimary: string;       // maps to palette.text.primary
    textSecondary: string;     // maps to palette.text.secondary
    divider?: string;          // maps to palette.divider
  };
  typography?: {
    fontFamily?: string;
  };
}

export interface TenantAssets {
  logo: string;
  favicon?: string;
  loginBackground?: string;
  bannerDashboard?: string;
  bannerDashboardMobile?: string;
  onboardingFinalIllustration?: string;
}

const DEFAULT_FONT_FAMILY = 'var(--font-chivo), Inter, system-ui, sans-serif';

/**
 * Creates a complete MUI theme from tenant configuration
 * Uses ONLY native MUI palette structure - no custom tokens
 * 
 * contrastText is calculated automatically by MUI based on luminance
 */
export function createTenantTheme(config: TenantThemeConfig): Theme {
  const {
    palette: {
      primary,
      secondary,
      background,
      paper,
      textPrimary,
      textSecondary,
      divider = '#E5E7EB',
    },
    typography: { fontFamily = DEFAULT_FONT_FAMILY } = {},
  } = config;

  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'light',
      primary: {
        main: primary,
        light: lighten(primary, .7),
        // light, dark, and contrastText are auto-calculated by MUI
      },
      secondary: {
        main: secondary,
        // light, dark, and contrastText are auto-calculated by MUI
      },
      background: {
        default: background,  // Main app background (e.g., #F5FAFA)
        paper: paper,         // Cards, dialogs, etc. (e.g., #FFFFFF)
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        disabled: '#9CA3AF',
      },
      divider: divider,
      // error, warning, info, success use MUI defaults
    },
    typography: {
      fontFamily,
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            // Uses palette.background.paper automatically
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'medium',
          sx: {
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
            },
          }
        },
      },
    },
  };

  return createTheme(themeOptions);
}

// Fallback theme for when API fails - uses native MUI structure
export const FALLBACK_THEME_CONFIG: TenantThemeConfig = {
  palette: {
    primary: '#0A3A3A',
    secondary: '#BEE1EB',
    background: '#F5FAFA',      // Main background
    paper: '#FFFFFF',           // Cards, dialogs
    textPrimary: '#041616',
    textSecondary: '#4A6060',
  },
  typography: {
    fontFamily: DEFAULT_FONT_FAMILY,
  },
};

export const FALLBACK_ASSETS: TenantAssets = {
  logo: buildAssetUrl('theme/logo.png'),
  favicon: '/favicon.ico',  // Keep favicon local for fast loading
  loginBackground: buildAssetUrl('theme/admin/login-background.png'),
  bannerDashboard: 'https://trya-assets-dev.s3.sa-east-1.amazonaws.com/theme/banner_dashboard_paciente.svg',
  bannerDashboardMobile: 'https://trya-assets-dev.s3.sa-east-1.amazonaws.com/theme/banner_dashboard_paciente.svg',
  onboardingFinalIllustration: buildAssetUrl('theme/paciente/triangulo_inicio.png'),
};

// ============================================================================
// PLATFORM THEMES - Static themes for platform-specific routes (médico, admin)
// These don't depend on tenant API - they're fixed for the platform
// ============================================================================

/**
 * Doctor (Médico) platform theme
 * Used for /medico/* routes (login, dashboard, evaluations)
 * Dark teal primary with light accents
 */
export const MEDICO_THEME_CONFIG: TenantThemeConfig = {
  palette: {
    primary: '#0A3A3A',         // Dark teal - professional medical look
    secondary: '#BEE1EB',       // Light cyan accent
    background: '#F5F5F5',      // Neutral gray background
    paper: '#FFFFFF',           // White cards
    textPrimary: '#0A3A3A',     // Dark teal text
    textSecondary: '#4A6060',   // Muted teal
  },
  typography: {
    fontFamily: DEFAULT_FONT_FAMILY,
  },
};

export const MEDICO_ASSETS: TenantAssets = {
  logo: buildAssetUrl('theme/logo.png'),
  favicon: '/favicon.ico',
  loginBackground: buildAssetUrl('theme/medico/login-background.png'),
  bannerDashboard: buildAssetUrl('theme/medico/dashboard_doctor.png'),
};

/**
 * Admin/RH platform theme
 * Used for /admin/* and /rh/* routes (hub administrativo)
 * Dark teal primary with rose accents - inverted from médico
 */
export const ADMIN_THEME_CONFIG: TenantThemeConfig = {
  palette: {
    primary: '#0A3A3A',         // Dark teal - primary color
    secondary: '#E8B4B8',       // Rose accent
    background: '#F5F5F5',      // Neutral gray background
    paper: '#FFFFFF',           // White cards
    textPrimary: '#0A3A3A',     // Dark teal text
    textSecondary: '#4A6060',   // Muted teal
  },
  typography: {
    fontFamily: DEFAULT_FONT_FAMILY,
  },
};

export const ADMIN_ASSETS: TenantAssets = {
  logo: buildAssetUrl('theme/logo.png'),
  favicon: '/favicon.ico',
  loginBackground: buildAssetUrl('theme/admin/login-background.png'),
  bannerDashboard: buildAssetUrl('theme/admin/banner_dashboard.png'),
};

/**
 * Checks if the current hostname is the default Trya platform (not a specific tenant)
 * 
 * Default patterns (returns true):
 * - dev-app.trya.ai
 * - hml-app.trya.ai  
 * - app.trya.ai
 * 
 * Tenant-specific patterns (returns false):
 * - dev-app-grupotrigo.trya.ai
 * - app-grupotrigo.trya.ai
 * - grupotrigo.trya.ai
 */
function isDefaultTenant(tenant?: string): boolean {
  if (!tenant) return true;
  return tenant === 'tenant-1' || tenant === 'trya';
}

/**
 * Check if a pathname is a platform route (uses static themes)
 * 
 * For DEFAULT Trya tenant (dev-app.trya.ai, app.trya.ai):
 * - /medico/* → MEDICO theme (doctors portal)
 * - /admin/*, /rh/*, /login → ADMIN theme (administrative hub)
 * - /paciente/* → Fetches from tenant API
 * 
 * For SPECIFIC tenants (dev-app-grupotrigo.trya.ai):
 * - ALL routes fetch from tenant API (includes their own login background, logo, etc)
 */
export function isPlatformRoute(pathname: string, tenant?: string): boolean {
  // Specific tenants ALWAYS fetch from API - they have their own themes
  if (!isDefaultTenant(tenant)) {
    return false;
  }
  
  // Default Trya uses static themes for these routes
  if (pathname === '/login' || pathname.startsWith('/login?')) {
    return true;
  }
  return pathname.startsWith('/medico') || pathname.startsWith('/admin') || pathname.startsWith('/rh');
}

/**
 * Get platform theme config for a given pathname
 * Returns null if should fetch from tenant API instead
 * 
 * @param pathname - Current URL pathname
 * @param tenant - Tenant identifier from hostname (e.g., 'grupotrigo', 'tenant-1')
 */
export function getPlatformTheme(pathname: string, tenant?: string): { config: TenantThemeConfig; assets: TenantAssets } | null {
  // Specific tenants don't use platform themes - fetch from their own API
  if (!isDefaultTenant(tenant)) {
    return null;
  }
  
  // Default Trya platform themes based on path
  if (pathname === '/login' || pathname.startsWith('/login?')) {
    return { config: ADMIN_THEME_CONFIG, assets: ADMIN_ASSETS };
  }
  if (pathname.startsWith('/medico')) {
    return { config: MEDICO_THEME_CONFIG, assets: MEDICO_ASSETS };
  }
  if (pathname.startsWith('/admin') || pathname.startsWith('/rh')) {
    return { config: ADMIN_THEME_CONFIG, assets: ADMIN_ASSETS };
  }
  
  return null;
}
