/**
 * Utilitários para preservar o tenant nas navegações
 */

/**
 * Tenant padrão do sistema
 */
export const DEFAULT_TENANT = 'tenant-1';

/**
 * Lista de tenants conhecidos
 * Formato: subdomain -> nome da tabela DynamoDB
 */
export const KNOWN_TENANTS: Record<string, string> = {
  'grupotrigo': 'grupotrigo',
  'clinicasaude': 'clinicasaude',
  'clinica-saude': 'clinicasaude',
};

/**
 * Extrai o tenant do hostname (subdomain)
 * 
 * Padrão de URL: {ambiente}-{tenant}.trya.ai
 * 
 * Exemplos:
 * - dev-app-grupotrigo.trya.ai -> grupotrigo
 * - staging-app-clinicasaude.trya.ai -> clinicasaude
 * - dev-app.trya.ai -> tenant-1 (default)
 * - localhost:3000 -> tenant-1 (default)
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
  // Ex: dev-app-grupotrigo -> encontra 'grupotrigo'
  for (const [tenantKey, tenantValue] of Object.entries(KNOWN_TENANTS)) {
    if (subdomain.endsWith(`-${tenantKey}`)) {
      return tenantValue;
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
 */
export function addTenantToUrl(url: string, currentTheme?: string): string {
  if (isDefaultTenant(currentTheme)) {
    return url;
  }
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tenant=${currentTheme}`;
}

/**
 * Verifica se o tenant precisa ser preservado na URL
 */
export function shouldPreserveTenant(currentTheme?: string): boolean {
  return !isDefaultTenant(currentTheme);
}

