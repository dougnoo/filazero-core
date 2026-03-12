/**
 * Utilitários para identificação e preservação do tenant nas navegações
 */

/**
 * Tenant padrão do sistema
 */
export const DEFAULT_TENANT = 'tenant-1';

/**
 * Lista de tenants conhecidos
 * Formato: slug -> nome formatado para exibição
 */
export const KNOWN_TENANTS: Record<string, string> = {
  'trya': 'Trya',
  'grupotrigo': 'Grupo Trigo',
};

/**
 * Interface for tenant identification result
 */
export interface TenantIdentification {
  tenant: string;
  source: 'subdomain' | 'query' | 'default';
}

/**
 * Identifies tenant from request context
 * Priority: subdomain > query param > default
 * 
 * @returns TenantIdentification object with tenant name and source
 * 
 * Subdomain patterns supported (tenant is identified after the last hyphen before .trya):
 * - grupotrigo.trya.ai -> grupotrigo
 * - app-grupotrigo.trya.ai -> grupotrigo
 * - dev-app-grupotrigo.trya.ai -> grupotrigo
 * - hml-app-grupotrigo.trya.ai -> grupotrigo
 * - dev-app.trya.ai -> default (no tenant suffix)
 * - app.trya.ai -> default (no tenant suffix)
 * 
 * Query parameters supported:
 * - ?tenant=client-name
 * - ?tenantName=client-name
 */
export function identifyTenant(): TenantIdentification {
  if (typeof window === 'undefined') {
    return { tenant: DEFAULT_TENANT, source: 'default' };
  }

  const hostname = window.location.hostname;
  
  // 1. Extract subdomain (part before .trya.ai)
  const subdomainMatch = hostname.match(/^([^.]+)\.trya\./i);
  if (subdomainMatch) {
    const subdomain = subdomainMatch[1].toLowerCase();
    
    // Known base patterns that indicate default tenant (no specific tenant suffix)
    const defaultPatterns = ['app', 'dev-app', 'hml-app', 'staging-app', 'prod-app'];
    
    if (defaultPatterns.includes(subdomain)) {
      // This is the default app, no specific tenant
      // Fall through to check query params or use default
    } else {
      // Check if subdomain ends with a known tenant (e.g., dev-app-grupotrigo, app-grupotrigo)
      // Pattern: {prefix}-{tenant} or just {tenant}
      for (const [tenantKey] of Object.entries(KNOWN_TENANTS)) {
        if (subdomain === tenantKey) {
          // Direct match: grupotrigo.trya.ai
          return { tenant: tenantKey, source: 'subdomain' };
        }
        if (subdomain.endsWith(`-${tenantKey}`)) {
          // Suffix match: dev-app-grupotrigo, app-grupotrigo, hml-app-grupotrigo
          return { tenant: tenantKey, source: 'subdomain' };
        }
      }
      
      // If subdomain doesn't match any known pattern, extract the last part after hyphen
      // This handles new tenants that aren't in KNOWN_TENANTS yet
      const parts = subdomain.split('-');
      if (parts.length > 1) {
        const possibleTenant = parts[parts.length - 1];
        // Only treat as tenant if it's not a known prefix
        if (!['app', 'dev', 'hml', 'staging', 'prod'].includes(possibleTenant)) {
          return { tenant: possibleTenant, source: 'subdomain' };
        }
      }
    }
  }

  // 2. Check query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const queryTenant = urlParams.get('tenant') || urlParams.get('tenantName');
  if (queryTenant) {
    const tenant = queryTenant.toLowerCase().trim();
    return { tenant, source: 'query' };
  }

  // 3. Default
  return { tenant: DEFAULT_TENANT, source: 'default' };
}

/**
 * Obtém o nome formatado do tenant atual baseado no hostname
 * Retorna null para tenant padrão (TRYA - não envia validação)
 * Usado para exibição na UI, não para chamadas de API
 */
export function getCurrentTenantName(): string | null {
  const tenantSlug = extractTenantFromHostname();
  if (tenantSlug === DEFAULT_TENANT) {
    return null;
  }
  // Retorna o nome formatado se existir, senão o slug
  return KNOWN_TENANTS[tenantSlug] || tenantSlug;
}

/**
 * Extrai o tenant slug do hostname (subdomain)
 * IMPORTANTE: Retorna o SLUG (ex: 'grupotrigo'), não o nome formatado
 * O slug é usado para chamadas de API e identificação do tenant
 * 
 * Padrão de URL: {ambiente}-{tenant}.trya.ai
 * 
 * Exemplos:
 * - dev-app-grupotrigo.trya.ai -> grupotrigo
 * - staging-app-clinicasaude.trya.ai -> clinicasaude
 * - dev-app.trya.ai -> trigo (default)
 * - localhost:3000 -> trigo (default)
 */
export function extractTenantFromHostname(hostname?: string): string {
  if (!hostname) {
    if (typeof window !== 'undefined') {
      hostname = window.location.hostname;
    } else {
      return DEFAULT_TENANT;
    }
  }

  // Se for localhost, usa query param ou default
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return DEFAULT_TENANT;
  }

  // Extrai o subdomain (primeira parte antes de .trya.ai)
  // Ex: dev-app-grupotrigo.trya.ai -> dev-app-grupotrigo
  const subdomain = hostname.split('.')[0];
  
  if (!subdomain) {
    return DEFAULT_TENANT;
  }

  // Procura por tenant conhecido no subdomain
  // Ex: dev-app-grupotrigo -> encontra 'grupotrigo' e RETORNA O SLUG
  for (const [tenantKey] of Object.entries(KNOWN_TENANTS)) {
    // Caso 1: o subdomain é exatamente o tenant (ex: grupotrigo.trya.ai)
    if (subdomain === tenantKey) {
      return tenantKey;
    }
    if (subdomain.endsWith(`-${tenantKey}`)) {
      return tenantKey; // Retorna o slug (chave), não o valor formatado
    }
  }

  // Se não encontrou tenant no subdomain, é o padrão
  return DEFAULT_TENANT;
}

/**
 * Verifica se o tenant é o padrão
 */
const isDefaultTenant = (tenant?: string | null): boolean => {
  if (!tenant || tenant.trim() === '') return true;
  const normalized = tenant.toLowerCase();
  return normalized === DEFAULT_TENANT.toLowerCase() || normalized === 'default';
};

/**
 * Preserva o tenant na URL
 * Se não tiver tenant especificado ou for 'trigo', não adiciona o parâmetro (é o padrão)
 */
export function getUrlWithTenant(path: string, currentTheme?: string): string {
  if (isDefaultTenant(currentTheme)) {
    return path;
  }
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}tenant=${currentTheme}`;
}

/**
 * Adiciona o tenant a uma URL que já tem query params
 * Se for 'trigo' ou 'default', não adiciona (é o padrão)
 * Remove parâmetros internos do Next.js (_rsc, _next, etc) antes de adicionar o tenant
 */
export function addTenantToUrl(url: string, currentTheme?: string): string {
  if (isDefaultTenant(currentTheme)) {
    // Remove parâmetros internos do Next.js mesmo se não houver tenant
    return url.split('?')[0];
  }
  
  // Remove parâmetros internos do Next.js (_rsc, etc) e query params existentes
  const [basePath, ...queryParts] = url.split('?');
  const existingParams = queryParts.join('?');
  const params = new URLSearchParams(existingParams);
  
  // Remove parâmetros internos do Next.js
  params.delete('_rsc');
  params.delete('_next');
  
  // Adiciona o tenant
  params.set('tenant', currentTheme!);
  
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Verifica se o tenant precisa ser preservado na URL
 */
export function shouldPreserveTenant(currentTheme?: string): boolean {
  return !isDefaultTenant(currentTheme);
}

