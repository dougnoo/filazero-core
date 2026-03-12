import { ClientTheme } from '../types/theme';
import { themeConfig, medicoTheme } from '../config/themeConfig';
import { DEFAULT_TENANT, extractTenantFromHostname, KNOWN_TENANTS } from '../utils/tenantUtils';

interface BrokerThemeAPIResponse {
  theme?: {
    name?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    backgroundSecondaryColor?: string;
    surfaceColor?: string;
    textPrimaryColor?: string;
    textSecondaryColor?: string;
    textDisabledColor?: string;
    borderDefaultColor?: string;
    borderHoverColor?: string;
    borderFocusColor?: string;
    buttonPrimaryColor?: string;
    buttonPrimaryHoverColor?: string;
    buttonTextColor?: string;
    logo?: string;
    favicon?: string;
    loginBackground?: string;
    showPoweredBy?: boolean;
    poweredByText?: string;
    fontFamily?: string;
    logoPosition?: 'left' | 'center' | 'right';
  };
}

interface CacheEntry {
  theme: ClientTheme;
  timestamp: number;
}

class ThemeService {
  private cache: Map<string, CacheEntry> = new Map();
  private currentSubdomain: string = DEFAULT_TENANT;
  private apiBaseUrl: string = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

  private normalizeTenant(tenant?: string | null): string {
    if (!tenant || tenant.trim() === '') {
      return DEFAULT_TENANT;
    }
    const normalized = tenant.trim().toLowerCase();
    if (normalized === 'default' || normalized === 'trigo') {
      return DEFAULT_TENANT;
    }
    // Mapeia para o nome correto da tabela DynamoDB
    if (normalized in KNOWN_TENANTS) {
      return KNOWN_TENANTS[normalized];
    }
    return tenant;
  }

  /**
   * Obtém o tenant atual do subdomain ou query params
   */
  private getCurrentSubdomain(): string {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      
      // Verifica se está na rota de médico
      if (pathname.startsWith('/medico')) {
        return 'medico';
      }
      
      // 1. Primeiro tenta extrair do subdomain (ex: dev-app-grupotrigo.trya.ai)
      const tenantFromSubdomain = extractTenantFromHostname();
      if (tenantFromSubdomain !== DEFAULT_TENANT) {
        return tenantFromSubdomain;
      }
      
      // 2. Fallback: tenta pegar da URL query param
      const urlParams = new URLSearchParams(window.location.search);
      const tenant = urlParams.get('tenant') || urlParams.get('tenantName');
      if (tenant) {
        return this.normalizeTenant(tenant);
      }
    }
    return this.currentSubdomain;
  }

  /**
   * Define o subdomínio atual (para teste)
   */
  setCurrentSubdomain(subdomain: string): void {
    this.currentSubdomain = this.normalizeTenant(subdomain);
  }

  /**
   * Verifica se o cache ainda é válido
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < themeConfig.cacheDuration;
  }

  /**
   * Busca o tema do cache
   */
  private getCachedTheme(subdomain: string): ClientTheme | null {
    const entry = this.cache.get(subdomain);
    if (entry && this.isCacheValid(entry)) {
      return entry.theme;
    }
    return null;
  }

  /**
   * Salva o tema no cache
   */
  private setCachedTheme(subdomain: string, theme: ClientTheme): void {
    this.cache.set(subdomain, {
      theme,
      timestamp: Date.now(),
    });
  }

  /**
   * Busca o tema do localStorage
   */
  private getStoredTheme(subdomain: string): ClientTheme | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(`${themeConfig.cacheKey}_${subdomain}`);
      if (stored) {
        const entry: CacheEntry = JSON.parse(stored);
        if (this.isCacheValid(entry)) {
          return entry.theme;
        }
      }
    } catch (error) {
    }
    
    return null;
  }

  /**
   * Salva o tema no localStorage
   */
  private setStoredTheme(subdomain: string, theme: ClientTheme): void {
    if (typeof window === 'undefined') return;
    
    try {
      const entry: CacheEntry = {
        theme,
        timestamp: Date.now(),
      };
      localStorage.setItem(`${themeConfig.cacheKey}_${subdomain}`, JSON.stringify(entry));
    } catch (error) {
    }
  }

  /**
   * Busca o tema da API
   */
  private async fetchThemeFromAPI(subdomain: string): Promise<ClientTheme> {
    const tenantName = this.normalizeTenant(subdomain);
    const endpoint = `${this.apiBaseUrl}${themeConfig.publicThemeEndpoint}?tenantName=${encodeURIComponent(tenantName)}`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar tema: ${response.status}`);
      }

      const payload: BrokerThemeAPIResponse = await response.json();
      return this.mapBrokerThemeResponse(tenantName, payload);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Converte o payload da API pública em ClientTheme
   */
  private mapBrokerThemeResponse(subdomain: string, payload: BrokerThemeAPIResponse): ClientTheme {
    const normalizedSubdomain = this.normalizeTenant(subdomain);
    const baseTheme = themeConfig.fallbackTheme;
    const tenantTheme = payload.theme ?? {};

    const primary = tenantTheme.primaryColor ?? baseTheme.colors.primary;
    const secondary = tenantTheme.secondaryColor ?? baseTheme.colors.secondary;

    const background = tenantTheme.backgroundColor ?? baseTheme.colors.background;
    const backgroundSecondary = tenantTheme.backgroundSecondaryColor ?? baseTheme.colors.backgroundSecondary;
    const surface = tenantTheme.surfaceColor ?? baseTheme.colors.surface;

    const textPrimary = tenantTheme.textPrimaryColor ?? baseTheme.colors.text.primary;
    const textSecondary = tenantTheme.textSecondaryColor ?? baseTheme.colors.text.secondary;
    const textDisabled = tenantTheme.textDisabledColor ?? baseTheme.colors.text.disabled;

    const borderDefault =  baseTheme.colors.border.default;
    const borderHover = tenantTheme.borderHoverColor ?? baseTheme.colors.border.hover;
    const borderFocus = tenantTheme.borderFocusColor ?? baseTheme.colors.border.focus;

    const buttonPrimary = tenantTheme.primaryColor ?? baseTheme.colors.button.primary;
    const buttonPrimaryHover = tenantTheme.primaryColor ?? tenantTheme.buttonPrimaryColor ?? baseTheme.colors.button.primaryHover;
    const buttonText = tenantTheme.secondaryColor ?? baseTheme.colors.button.text;

    return {
      id: normalizedSubdomain,
      name: tenantTheme.name ?? `${normalizedSubdomain} Theme`,
      subdomain: normalizedSubdomain,
      colors: {
        primary,
        secondary,
        background,
        backgroundSecondary,
        surface,
        text: {
          primary: textPrimary,
          secondary: textSecondary,
          disabled: textDisabled,
        },
        border: {
          default: borderDefault,
          hover: borderHover,
          focus: borderFocus,
        },
        button: {
          primary: buttonPrimary,
          primaryHover: buttonPrimaryHover,
          text: buttonText,
        },
      },
      images: {
        logo: tenantTheme.logo ?? baseTheme.images.logo,
        backgroundPattern: tenantTheme.loginBackground ?? baseTheme.images.backgroundPattern,
        favicon: tenantTheme.favicon ?? baseTheme.images.favicon,
      },
      typography: {
        fontFamily: tenantTheme.fontFamily ?? baseTheme.typography.fontFamily,
        heading: { ...baseTheme.typography.heading },
        body: { ...baseTheme.typography.body },
        caption: { ...baseTheme.typography.caption },
      },
      layout: {
        logoPosition: tenantTheme.logoPosition ?? baseTheme.layout.logoPosition,
        showPoweredBy: tenantTheme.showPoweredBy ?? baseTheme.layout.showPoweredBy,
        poweredByText: tenantTheme.poweredByText ?? baseTheme.layout.poweredByText,
      },
    };
  }

  /**
   * Obtém o tema do cliente
   */
  async getClientTheme(): Promise<ClientTheme> {
    const subdomain = this.normalizeTenant(this.getCurrentSubdomain());

    // Se for rota de médico, retorna tema específico
    if (subdomain === 'medico') {
      return medicoTheme;
    }

    const cachedTheme = this.getCachedTheme(subdomain);
    if (cachedTheme) {
      return cachedTheme;
    }

    const storedTheme = this.getStoredTheme(subdomain);
    if (storedTheme) {
      this.setCachedTheme(subdomain, storedTheme);
      return storedTheme;
    }

    try {
      const fetchedTheme = await this.fetchThemeFromAPI(subdomain);
      this.setCachedTheme(subdomain, fetchedTheme);
      this.setStoredTheme(subdomain, fetchedTheme);
      return fetchedTheme;
    } catch {
      // Retorna tema padrão em caso de falha
      const fallbackTheme = this.mapBrokerThemeResponse(subdomain, {});
      this.setCachedTheme(subdomain, fallbackTheme);
      return fallbackTheme;
    }
  }

  /**
   * Força a atualização do tema
   */
  async refreshTheme(): Promise<ClientTheme> {
    const subdomain = this.getCurrentSubdomain();
    
    // Remove do cache
    this.cache.delete(subdomain);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${themeConfig.cacheKey}_${subdomain}`);
    }

    // Busca novamente
    return this.getClientTheme();
  }

  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(themeConfig.cacheKey)
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
  }
}

export const themeService = new ThemeService();
