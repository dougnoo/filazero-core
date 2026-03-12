import { registerAs } from '@nestjs/config';

/**
 * Configuração centralizada de buckets S3.
 *
 * Nomenclatura padrão: {tenant}-assets-{environment}
 *
 * Ambientes:
 * - dev: desenvolvimento
 * - hml: homologação
 * - prod: produção
 */

export type Environment = 'development' | 'staging' | 'production';
export type BucketEnvironment = 'dev' | 'hml' | 'prod';

const ENV_MAP: Record<Environment, BucketEnvironment> = {
  development: 'dev',
  staging: 'hml',
  production: 'prod',
};

function getEnvironmentSuffix(): BucketEnvironment {
  const nodeEnv = (process.env.NODE_ENV || 'development') as Environment;
  return ENV_MAP[nodeEnv] || 'dev';
}

function getTenantBucket(tenantName: string): string {
  const env = getEnvironmentSuffix();
  return `${tenantName}-assets-${env}`;
}

export const KNOWN_TENANTS = ['trya', 'grupotrigo'] as const;
export type KnownTenant = (typeof KNOWN_TENANTS)[number];

export default registerAs('buckets', () => {
  const env = getEnvironmentSuffix();
  const region = process.env.AWS_REGION || 'us-east-1';

  return {
    region,
    environment: env,

    // Buckets de tenant (assets: logos, favicons, backgrounds)
    tenants: {
      trya: getTenantBucket('trya'),
      grupotrigo: getTenantBucket('grupotrigo'),
    } as Record<KnownTenant, string>,

    // Buckets de infraestrutura
    platform: `trya-platform-assets-${env}`,
    triagem: `triagem-ia-${env}`,
    frontend: `trya-frontend-${env}`,
    chat: process.env.S3_BUCKET_CHAT_NAME || `trya-chat-${env}`,

    // Função helper para obter bucket de tenant dinamicamente
    getTenantBucket,

    // Mapa de regiões específicas por bucket (quando diferente do padrão)
    regionMap: parseRegionMap(),

    // URLs de CDN por ambiente
    cdnUrl: getCdnUrl(env),
  };
});

function parseRegionMap(): Record<string, string> {
  const mapJson = process.env.BUCKET_REGION_MAP;
  if (!mapJson) return {};

  try {
    return JSON.parse(mapJson);
  } catch {
    console.warn('Invalid BUCKET_REGION_MAP JSON, using empty map');
    return {};
  }
}

function getCdnUrl(env: BucketEnvironment): string {
  const urls: Record<BucketEnvironment, string> = {
    dev: 'https://dev-app.trya.ai',
    hml: 'https://hml-app.trya.ai',
    prod: 'https://app.trya.ai',
  };
  return process.env.ASSETS_CDN_URL || urls[env];
}

// Exporta função utilitária para uso direto (sem DI)
export function getBucketForTenant(
  tenantName: string,
  env?: BucketEnvironment,
): string {
  const environment = env || getEnvironmentSuffix();
  return `${tenantName}-assets-${environment}`;
}

export function getBucketUrl(bucketName: string, region?: string): string {
  const bucketRegion = region || process.env.AWS_REGION || 'us-east-1';
  return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com`;
}
