'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ClientTheme } from '../types/theme';
import { themeService } from '../services/themeService';
import { RoleSlug, RoleEnum } from '../role';
import { applyRoleToTheme } from '../theme/mergeRole';
import { DEFAULT_TENANT, extractTenantFromHostname } from '../utils/tenantUtils';

interface GlobalThemeContextType {
  currentTheme: string;                     // tenant/subdomínio
  setCurrentTheme: (theme: string) => void;
  role: RoleSlug;                           // perfil
  setRole: (r: RoleSlug) => void;
  theme: ClientTheme;                       // tema final (tenant + role)
  isLoading: boolean;
  error: string | null;
  refreshTheme: () => Promise<void>;
}
const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

export function GlobalThemeProvider({ children }: { children: React.ReactNode }) {
  const normalizeTenant = (tenant?: string | null) => {
    if (!tenant || tenant.trim() === '' || tenant.toLowerCase() === 'default') {
      return DEFAULT_TENANT;
    }
    return tenant;
  };

  // Lê o tenant do subdomain, URL ou localStorage (nessa ordem de prioridade)
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      // 1. Primeiro tenta extrair do subdomain (ex: dev-app-grupotrigo.trya.ai)
      const tenantFromSubdomain = extractTenantFromHostname();
      if (tenantFromSubdomain !== DEFAULT_TENANT) {
        localStorage.setItem('currentTenant', tenantFromSubdomain);
        return tenantFromSubdomain;
      }
      
      // 2. Se não tem no subdomain, tenta pegar da URL query param
      const urlParams = new URLSearchParams(window.location.search);
      const tenantFromUrl = urlParams.get('tenant') || urlParams.get('tenantName');
      
      if (tenantFromUrl) {
        // Se veio da URL, salva no localStorage
        const normalized = normalizeTenant(tenantFromUrl);
        localStorage.setItem('currentTenant', normalized);
        return normalized;
      }
      
      // 3. Se não tem na URL, tenta pegar do localStorage
      const tenantFromStorage = localStorage.getItem('currentTenant');
      if (tenantFromStorage) {
        return normalizeTenant(tenantFromStorage);
      }
      
      return DEFAULT_TENANT;
    }
    return DEFAULT_TENANT;
  };

  const [currentTheme, setCurrentTheme] = useState<string>(DEFAULT_TENANT); // tenant
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialTheme = getInitialTheme();
      if (initialTheme !== currentTheme) {
        setCurrentTheme(initialTheme);
      }
    }
  }, []);
  
  // Salva no localStorage sempre que o tema mudar
  useEffect(() => {
    if (typeof window !== 'undefined' && currentTheme) {
      localStorage.setItem('currentTenant', normalizeTenant(currentTheme));
    }
  }, [currentTheme]);
  const [role, setRole] = useState<RoleSlug>(RoleEnum.Paciente);      // role
  const [tenantTheme, setTenantTheme] = useState<ClientTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      themeService.setCurrentSubdomain(currentTheme);
      const clientTheme = await themeService.getClientTheme(); // continua seu fluxo atual
      setTenantTheme(clientTheme);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentTheme]);

  useEffect(() => { loadTheme(); }, [loadTheme]);
  const refreshTheme = async () => { await loadTheme(); };

  // Monitora mudanças na URL para atualizar o tenant
  useEffect(() => {
    const checkUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tenant = normalizeTenant(urlParams.get('tenant') || urlParams.get('tenantName'));
      if (tenant !== currentTheme) {
        setCurrentTheme(tenant);
      }
    };
    
    checkUrlChange();
    
    // Listen para mudanças de URL (back/forward)
    window.addEventListener('popstate', checkUrlChange);
    return () => window.removeEventListener('popstate', checkUrlChange);
  }, [currentTheme]);

  // tema final entregue para a UI
  const uiTheme = useMemo(() => {
    if (!tenantTheme || !tenantTheme.colors || !tenantTheme.colors.button) {
      return tenantTheme as ClientTheme;
    }
    return applyRoleToTheme(tenantTheme, role);
  }, [tenantTheme, role]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const faviconUrl = uiTheme?.images?.favicon;
    const href = faviconUrl && faviconUrl.trim() !== '' ? faviconUrl : '/favicon.ico';

    const selectors = ["link[rel='icon']", "link[rel='shortcut icon']", "link[rel='apple-touch-icon']"];    

    const ensureLink = (selector: string, relValue: string) => {
      let link = document.querySelector<HTMLLinkElement>(selector);
      if (!link) {
        link = document.createElement('link');
        link.rel = relValue;
        document.head.appendChild(link);
      }
      return link;
    };

    const type = faviconUrl?.startsWith('data:image/svg+xml')
      ? 'image/svg+xml'
      : faviconUrl?.endsWith('.png')
      ? 'image/png'
      : faviconUrl?.endsWith('.jpg') || faviconUrl?.endsWith('.jpeg')
      ? 'image/jpeg'
      : 'image/x-icon';

    selectors.forEach((selector) => {
      const relValue = selector.slice(selector.indexOf("'") + 1, selector.lastIndexOf("'"));
      const link = ensureLink(selector, relValue);
      if (link.href !== href) {
        link.setAttribute('href', href);
        link.setAttribute('type', type);
      }
    });
  }, [uiTheme?.images?.favicon]);

  return (
    <GlobalThemeContext.Provider value={{
      currentTheme,
      setCurrentTheme,
      role,
      setRole,
      theme: uiTheme,
      isLoading,
      error,
      refreshTheme,
    }}>
      {children}
    </GlobalThemeContext.Provider>
  );
}

export function useGlobalThemeContext(): GlobalThemeContextType {
  const ctx = useContext(GlobalThemeContext);
  if (!ctx) throw new Error('useGlobalThemeContext deve ser usado dentro de um GlobalThemeProvider');
  return ctx;
}
