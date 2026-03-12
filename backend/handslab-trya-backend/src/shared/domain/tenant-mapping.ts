/**
 * Mapeamento de nomes de tenants alternativos para o nome canônico (tabela DynamoDB)
 * Formato: 'nome-alternativo' -> 'nome-canonico'
 */
export const TENANT_NAME_MAPPING: Record<string, string> = {
  'grupo-trigo': 'grupotrigo',
  'grupo trigo': 'grupotrigo',
  'trigo-investimentos': 'grupotrigo',
  trigoinvestimentos: 'grupotrigo',
  // Mapeamento do tenant padrão (frontend usa 'trya', DynamoDB usa 'tenant-1')
  trya: 'tenant-1',
  default: 'tenant-1',
  // Tenants de desenvolvimento
  'dev-app': 'tenant-1',
};

/**
 * Normaliza o nome do tenant para o formato canônico usado no DynamoDB
 * @param tenantName Nome do tenant (pode conter hífen ou outras variações)
 * @param environment Ambiente atual (development, staging, production) - opcional
 * @returns Nome canônico do tenant com sufixo de ambiente se necessário
 */
export function normalizeTenantName(tenantName: string, environment?: string): string {
  const normalized = tenantName.trim().toLowerCase();
  
  // Se existir um mapeamento, usa o nome canônico
  let canonicalName = normalized in TENANT_NAME_MAPPING 
    ? TENANT_NAME_MAPPING[normalized] 
    : normalized;
  
  // Adiciona sufixo de ambiente para staging/hml
  if (environment === 'staging' || environment === 'hml') {
    canonicalName = `${canonicalName}-hml`;
  }
  
  return canonicalName;
}
