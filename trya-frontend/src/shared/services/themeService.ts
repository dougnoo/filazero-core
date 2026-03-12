import { TenantThemeConfig, TenantAssets, FALLBACK_THEME_CONFIG, FALLBACK_ASSETS } from '../theme/createTenantTheme';

interface BrokerThemeAPIResponse {
  theme?: {
    name?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;      // Maps to palette.background.default
    surfaceColor?: string;         // Maps to palette.background.paper
    textPrimaryColor?: string;
    textSecondaryColor?: string;
    logo?: string;
    favicon?: string;
    loginBackground?: string;
    bannerDashboard?: string;
    bannerDashboardMobile?: string;
    onboardingFinalIllustration?: string;
    showPoweredBy?: boolean;
    poweredByText?: string;
    fontFamily?: string;
  };
}

interface CachedTheme {
  config: TenantThemeConfig;
  assets: TenantAssets;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = 'client_theme_v2_'; // Keep existing cache key

class ThemeService {
  private memoryCache: Map<string, CachedTheme> = new Map();
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
  }

  async fetchTenantTheme(tenant: string): Promise<{ config: TenantThemeConfig; assets: TenantAssets }> {
    // Check memory cache
    const cached = this.getFromCache(tenant);
    if (cached) return cached;

    // Check localStorage cache
    const stored = this.getFromStorage(tenant);
    if (stored) {
      this.memoryCache.set(tenant, stored);
      return { config: stored.config, assets: stored.assets };
    }

    // Fetch from API
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/public/broker-theme?tenantName=${encodeURIComponent(tenant)}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch theme: ${response.status}`);
      }

      const payload: BrokerThemeAPIResponse = await response.json();
      const result = this.mapApiResponse(payload);
      
      this.saveToCache(tenant, result.config, result.assets);
      return result;
    } catch (error) {
      console.error(`Failed to fetch theme for tenant ${tenant}:`, error);
      return { config: FALLBACK_THEME_CONFIG, assets: FALLBACK_ASSETS };
    }
  }

  /**
   * Maps API response to native MUI palette structure
   * No custom tokens - only official MUI palette tokens
   */
  private mapApiResponse(payload: BrokerThemeAPIResponse): { config: TenantThemeConfig; assets: TenantAssets } {
    const theme = payload.theme ?? {};

    const config: TenantThemeConfig = {
      palette: {
        primary: theme.primaryColor ?? FALLBACK_THEME_CONFIG.palette.primary,
        secondary: theme.secondaryColor ?? FALLBACK_THEME_CONFIG.palette.secondary,
        background: theme.backgroundColor ?? FALLBACK_THEME_CONFIG.palette.background,
        paper: theme.surfaceColor ?? FALLBACK_THEME_CONFIG.palette.paper,
        textPrimary: theme.textPrimaryColor ?? FALLBACK_THEME_CONFIG.palette.textPrimary,
        textSecondary: theme.textSecondaryColor ?? FALLBACK_THEME_CONFIG.palette.textSecondary,
      },
      typography: {
        fontFamily: theme.fontFamily ?? FALLBACK_THEME_CONFIG.typography?.fontFamily,
      },
    };

    const assets: TenantAssets = {
      logo: theme.logo ?? FALLBACK_ASSETS.logo,
      favicon: theme.favicon ?? FALLBACK_ASSETS.favicon,
      loginBackground: theme.loginBackground ?? FALLBACK_ASSETS.loginBackground,
      bannerDashboard: theme.bannerDashboard ?? FALLBACK_ASSETS.bannerDashboard,
      bannerDashboardMobile: theme.bannerDashboardMobile ?? FALLBACK_ASSETS.bannerDashboardMobile,
      onboardingFinalIllustration: theme.onboardingFinalIllustration ?? FALLBACK_ASSETS.onboardingFinalIllustration,
    };

    return { config, assets };
  }

  private getFromCache(tenant: string): { config: TenantThemeConfig; assets: TenantAssets } | null {
    const cached = this.memoryCache.get(tenant);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return { config: cached.config, assets: cached.assets };
    }
    return null;
  }

  private getFromStorage(tenant: string): CachedTheme | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(`${CACHE_KEY_PREFIX}${tenant}`);
      if (stored) {
        const parsed: CachedTheme = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }

  private saveToCache(tenant: string, config: TenantThemeConfig, assets: TenantAssets): void {
    const cached: CachedTheme = { config, assets, timestamp: Date.now() };
    this.memoryCache.set(tenant, cached);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${CACHE_KEY_PREFIX}${tenant}`, JSON.stringify(cached));
      } catch {
        // Ignore storage errors
      }
    }
  }

  clearCache(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined') {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_KEY_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    }
  }
}

export const themeService = new ThemeService();
