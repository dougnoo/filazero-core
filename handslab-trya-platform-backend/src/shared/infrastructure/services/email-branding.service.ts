import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * Branding de e-mail por tenant
 */
export interface EmailBranding {
  /** Banner do e-mail em base64 (data URI) */
  bannerSrc: string;
  /** Ícone de alerta/importante em base64 (data URI) */
  iconImportantSrc: string;
  /** Nome de exibição do tenant */
  tenantDisplayName: string;
  /** Cor primária do tenant */
  primaryColor: string;
  /** Cor primária clara (para backgrounds) */
  primaryColorLight: string;
  /** Cor do texto do botão */
  buttonTextColor: string;
}

/**
 * Mapeamento de tenants para configurações
 */
interface TenantConfig {
  bucketName: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
}

/**
 * Serviço responsável por resolver assets de e-mail por tenant
 * Baixa imagens do S3 e converte para base64 (Data URI)
 * Implementa cache para evitar downloads repetidos
 *
 * Versão simplificada para platform-backend (sem DynamoDB)
 */
@Injectable()
export class EmailBrandingService {
  private readonly logger = new Logger(EmailBrandingService.name);
  private readonly defaultBucketRegion: string;
  private readonly s3ClientsCache: Map<string, S3Client> = new Map();
  private readonly brandingCache: Map<
    string,
    { branding: EmailBranding; timestamp: number }
  > = new Map();
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutos
  private readonly credentials: Record<string, unknown>;

  // Configurações de tenants conhecidos
  private getTenantConfigs(): Record<string, TenantConfig> {
    const envSuffix = this.configService.get<string>('TENANT_BUCKET_SUFFIX', '');
    
    return {
      grupotrigo: {
        bucketName: `grupotrigo-assets${envSuffix}`,
        displayName: 'Grupo Trigo',
        primaryColor: '#FAB900',
        secondaryColor: '#2F3237',
      },
      trya: {
        bucketName: this.configService.get<string>('TRYA_ASSETS_BUCKET', `trya-assets${envSuffix}`),
        displayName: 'Trya',
        primaryColor: '#041616',
        secondaryColor: '#BEE1EB',
      },
    };
  }

  // Valores padrão (fallback)
  private readonly defaultBranding: EmailBranding = {
    bannerSrc: '',
    iconImportantSrc: '',
    tenantDisplayName: 'Trya',
    primaryColor: '#041616',
    primaryColorLight: '#BEE1EB33',
    buttonTextColor: '#FFFFFF',
  };

  constructor(private readonly configService: ConfigService) {
    this.defaultBucketRegion = this.configService.get<string>(
      'AWS_REGION',
      'us-east-1',
    );

    const profile = this.configService.get<string>('AWS_PROFILE');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    this.credentials = {
      ...(profile ? { profile } : {}),
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    };
  }

  /**
   * Obtém o branding de e-mail para um tenant específico
   * @param tenantName Nome/slug do tenant (ex: 'grupotrigo')
   * @returns Branding com assets em base64
   */
  async getBrandingAsync(tenantName?: string): Promise<EmailBranding> {
    const normalizedTenant = this.normalizeTenantName(tenantName);

    // Verifica cache
    const cached = this.brandingCache.get(normalizedTenant);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.branding;
    }

    try {
      // Busca configurações do tenant
      const tenantConfigs = this.getTenantConfigs();
      const tenantConfig =
        tenantConfigs[normalizedTenant] || tenantConfigs['trya'];
      
      // Usa PNG em vez de SVG (webmail bloqueia SVG por segurança)
      const cloudFrontUrl = this.configService.get<string>('ASSETS_CDN_URL', 'https://app.trya.ai');
      const bannerSrc = `${cloudFrontUrl}/e/b_${normalizedTenant}.png`;
      const iconImportantSrc = `${cloudFrontUrl}/e/i_${normalizedTenant}.png`;

      this.logger.log(`Email branding for tenant ${normalizedTenant}:`);
      this.logger.log(`  CDN URL: ${cloudFrontUrl}`);
      this.logger.log(`  Banner: ${bannerSrc}`);
      this.logger.log(`  Icon: ${iconImportantSrc}`);

      const branding: EmailBranding = {
        bannerSrc,
        iconImportantSrc,
        tenantDisplayName: tenantConfig.displayName,
        primaryColor: tenantConfig.primaryColor,
        primaryColorLight: this.lightenColor(tenantConfig.primaryColor, 0.2),
        buttonTextColor: this.getContrastColor(tenantConfig.primaryColor),
      };

      // Salva no cache
      this.brandingCache.set(normalizedTenant, {
        branding,
        timestamp: Date.now(),
      });

      return branding;
    } catch (error) {
      this.logger.error(
        `Erro ao obter branding para tenant ${normalizedTenant}`,
        error,
      );
      return this.getDefaultBrandingAsync();
    }
  }

  /**
   * Normaliza o nome do tenant
   */
  private normalizeTenantName(tenantName?: string): string {
    if (!tenantName) return 'trya';
    const normalized = tenantName.trim().toLowerCase();
    const mapping: Record<string, string> = {
      'grupo-trigo': 'grupotrigo',
    };
    return mapping[normalized] || normalized;
  }

  /**
   * Determina a região do bucket baseado no nome ou configuração
   */
  private getBucketRegion(bucketName: string): string {
    // Tenta obter região específica da configuração
    const bucketRegionMap = this.configService.get<Record<string, string>>('BUCKET_REGION_MAP', {});
    
    if (bucketRegionMap[bucketName]) {
      return bucketRegionMap[bucketName];
    }
    
    // Fallback: detecta por sufixo
    if (bucketName.includes('-sa')) {
      return 'sa-east-1';
    }
    
    // Padrão: us-east-1
    return this.defaultBucketRegion;
  }

  /**
   * Retorna o branding padrão (Trya)
   */
  private async getDefaultBrandingAsync(): Promise<EmailBranding> {
    const cached = this.brandingCache.get('_default');
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.branding;
    }

    // Usa PNG em vez de SVG (webmail bloqueia SVG por segurança)
    const cloudFrontUrl = this.configService.get<string>('ASSETS_CDN_URL', 'https://app.trya.ai');
    const bannerSrc = `${cloudFrontUrl}/e/b_trya.png`;
    const iconImportantSrc = `${cloudFrontUrl}/e/i_trya.png`;

    const branding: EmailBranding = {
      ...this.defaultBranding,
      bannerSrc,
      iconImportantSrc,
    };

    this.brandingCache.set('_default', { branding, timestamp: Date.now() });
    return branding;
  }

  /**
   * Baixa um arquivo do S3 e retorna como base64 data URI
   */
  private async downloadAsBase64Async(
    bucketName: string,
    key: string,
    region?: string,
  ): Promise<string> {
    try {
      const s3Client = this.getS3ClientForRegion(region || this.defaultBucketRegion);

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await s3Client.send(command);

      if (!response.Body) {
        this.logger.warn(`Arquivo vazio no S3: ${bucketName}/${key}`);
        return '';
      }

      // Converte stream para buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString('base64');

      // Determina o tipo MIME
      const contentType = response.ContentType || this.getMimeTypeFromKey(key);

      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      this.logger.warn(`Não foi possível baixar ${bucketName}/${key}`, error);
      return '';
    }
  }

  /**
   * Cria ou retorna um S3Client para uma região específica
   */
  private getS3ClientForRegion(region: string): S3Client {
    if (this.s3ClientsCache.has(region)) {
      return this.s3ClientsCache.get(region)!;
    }

    const client = new S3Client({
      region,
      ...this.credentials,
    });

    this.s3ClientsCache.set(region, client);
    return client;
  }

  /**
   * Determina o tipo MIME baseado na extensão do arquivo
   */
  private getMimeTypeFromKey(key: string): string {
    const extension = key.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      ico: 'image/x-icon',
    };

    return mimeMap[extension || ''] || 'image/png';
  }

  /**
   * Clareia uma cor hex
   */
  private lightenColor(hex: string, percent: number): string {
    try {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent * 100);
      const R = Math.min(255, (num >> 16) + amt);
      const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
      const B = Math.min(255, (num & 0x0000ff) + amt);
      return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}33`;
    } catch {
      return '#BEE1EB33';
    }
  }

  /**
   * Retorna cor de contraste (branco ou preto) baseado no luminance
   */
  private getContrastColor(hex: string): string {
    try {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = (num >> 16) & 0xff;
      const g = (num >> 8) & 0xff;
      const b = num & 0xff;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#2F3237' : '#FFFFFF';
    } catch {
      return '#FFFFFF';
    }
  }

  /**
   * Limpa o cache de branding
   */
  clearCache(): void {
    this.brandingCache.clear();
  }
}
