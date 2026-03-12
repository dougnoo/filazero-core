'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';

import { identifyTenant } from '../utils/tenantUtils';
import { themeService } from '../services/themeService';
import { 
  createTenantTheme, 
  TenantAssets, 
  FALLBACK_THEME_CONFIG, 
  FALLBACK_ASSETS,
  getPlatformTheme,
} from '../theme/createTenantTheme';

/**
 * Context for tenant assets (logo, favicon, backgrounds)
 * Separate from MUI theme because assets are used in specific places only
 */
interface TenantAssetsContextType {
  assets: TenantAssets;
  tenant: string;
  isLoading: boolean;
  error: string | null;
  refreshTheme: () => Promise<void>;
}

const TenantAssetsContext = createContext<TenantAssetsContextType | undefined>(undefined);

/**
 * Hook to access tenant assets (logo, favicon, backgrounds)
 * Use this only in components that need assets - most components just use MUI's useTheme()
 */
export function useTenantAssets(): TenantAssetsContextType {
  const context = useContext(TenantAssetsContext);
  if (!context) {
    throw new Error('useTenantAssets must be used within TenantThemeProvider');
  }
  return context;
}

interface TenantThemeProviderProps {
  children: React.ReactNode;
}

export function TenantThemeProvider({ children }: TenantThemeProviderProps) {
  const [tenant, setTenant] = useState<string>('');
  const [theme, setTheme] = useState<Theme>(() => createTenantTheme(FALLBACK_THEME_CONFIG));
  const [assets, setAssets] = useState<TenantAssets>(FALLBACK_ASSETS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Emotion cache for SSR
  const [{ cache: emotionCache, flushStyles }] = useState(() => {
    const cache = createCache({ key: 'mui', prepend: true });
    cache.compat = true;

    const prevInsert = cache.insert;
    let inserted: string[] = [];

    cache.insert = (...args) => {
      const [, serialized] = args;
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flushStyles = () => {
      const names = [...inserted];
      inserted = [];
      return names;
    };

    return { cache, flushStyles };
  });

  useServerInsertedHTML(() => {
    const names = flushStyles();
    if (names.length === 0) return null;

    const styles = names.map((name) => emotionCache.inserted[name]).join('');
    return (
      <style
        key={emotionCache.key}
        data-emotion={`${emotionCache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  const loadTheme = useCallback(async (tenantId: string) => {
    setIsLoading(true);
    setError(null);

    // Check if this is a platform route (médico, admin, etc.)
    // Platform routes use static themes, not tenant API
    // IMPORTANT: Pass tenantId so tenant-specific logins fetch from API
    if (typeof window !== 'undefined') {
      const platformTheme = getPlatformTheme(window.location.pathname, tenantId);
      if (platformTheme) {
        const muiTheme = createTenantTheme(platformTheme.config);
        setTheme(muiTheme);
        setAssets(platformTheme.assets);
        setIsLoading(false);
        return;
      }
    }

    try {
      const { config, assets: tenantAssets } = await themeService.fetchTenantTheme(tenantId);
      
      // Create MUI theme from config (colors + typography)
      const muiTheme = createTenantTheme(config);
      setTheme(muiTheme);
      
      // Set assets separately
      setAssets(tenantAssets);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load theme';
      setError(message);
      // Keep fallback theme and assets
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial tenant identification and theme load
  useEffect(() => {
    const { tenant: identifiedTenant } = identifyTenant();
    setTenant(identifiedTenant);
    loadTheme(identifiedTenant);
  }, [loadTheme]);

  // Update favicon when assets change
  useEffect(() => {
    if (typeof document === 'undefined' || !assets.favicon) return;

    const updateFavicon = (selector: string, rel: string) => {
      let link = document.querySelector<HTMLLinkElement>(selector);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = assets.favicon!;
    };

    updateFavicon("link[rel='icon']", 'icon');
    updateFavicon("link[rel='shortcut icon']", 'shortcut icon');
  }, [assets.favicon]);

  // Listen for URL changes (tenant switch via query param or platform route change)
  useEffect(() => {
    let isMounted = true;
    let lastPathname = '';
    
    const handleUrlChange = () => {
      if (!isMounted || typeof window === 'undefined') return;
      
      // Ignore changes that are only query parameter updates (like _rsc)
      const currentPathname = window.location.pathname;
      const currentSearch = window.location.search;
      
      // Extract only meaningful query params (exclude Next.js internal params)
      const params = new URLSearchParams(currentSearch);
      params.delete('_rsc');
      params.delete('_next');
      const meaningfulParams = params.toString();
      
      // Only process if pathname changed or meaningful query params changed
      const currentUrlKey = `${currentPathname}?${meaningfulParams}`;
      if (currentUrlKey === lastPathname) {
        return; // No meaningful change, ignore
      }
      lastPathname = currentUrlKey;
      
      // First identify the current tenant
      const { tenant: currentTenant } = identifyTenant();
      
      // Check if navigating to/from a platform route
      // Pass tenant so tenant-specific routes don't use platform theme
      const platformTheme = getPlatformTheme(currentPathname, currentTenant);
      if (platformTheme) {
        const muiTheme = createTenantTheme(platformTheme.config);
        setTheme(muiTheme);
        setAssets(platformTheme.assets);
        return;
      }

      // Otherwise, check for tenant change
      // Only update if tenant actually changed to avoid unnecessary re-renders
      if (currentTenant !== tenant && currentTenant) {
        setTenant(currentTenant);
        loadTheme(currentTenant);
      }
    };

    // Initialize lastPathname
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('_rsc');
      params.delete('_next');
      lastPathname = `${window.location.pathname}?${params.toString()}`;
    }

    // Use a small delay to debounce rapid URL changes (like _rsc parameter updates)
    const timeoutId = setTimeout(() => {
      handleUrlChange();
    }, 100);

    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [tenant, loadTheme]);

  const refreshTheme = useCallback(async () => {
    themeService.clearCache();
    await loadTheme(tenant);
  }, [tenant, loadTheme]);

  // Assets context value (separate from MUI theme)
  const assetsContextValue = useMemo<TenantAssetsContextType>(
    () => ({ assets, tenant, isLoading, error, refreshTheme }),
    [assets, tenant, isLoading, error, refreshTheme]
  );

  return (
    <CacheProvider value={emotionCache}>
      {/* MUI Theme Provider - colors and typography */}
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {/* Assets Context - logo, favicon, backgrounds */}
        <TenantAssetsContext.Provider value={assetsContextValue}>
          {children}
        </TenantAssetsContext.Provider>
      </MuiThemeProvider>
    </CacheProvider>
  );
}
