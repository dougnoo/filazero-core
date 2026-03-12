import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { IConfigRepository } from '../../../public-config/domain/repositories/config.repository.interface';
import { CONFIG_REPOSITORY_TOKEN } from '../../../public-config/domain/repositories/config.repository.token';
import { normalizeTenantName } from '../../../../shared/domain/tenant-mapping';
import {
  isThemeConfig,
  isBucketConfig,
} from '../../../public-config/domain/entities/config-data.entity';

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
  /** Nome da plataforma para rodapé do email */
  platformName: string;
  /** Cor primária do tenant */
  primaryColor: string;
  /** Cor primária clara (para backgrounds) */
  primaryColorLight: string;
  /** Cor do texto do botão */
  buttonTextColor: string;
}

/**
 * Serviço responsável por resolver assets de e-mail por tenant
 * Baixa imagens do S3 e converte para base64 (Data URI)
 * Implementa cache para evitar downloads repetidos
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

  // Valores padrão (fallback)
  private readonly defaultBranding: EmailBranding = {
    bannerSrc: '',
    iconImportantSrc: '',
    tenantDisplayName: 'Trya',
    platformName: 'Trya Saúde',
    primaryColor: '#041616',
    primaryColorLight: '#BEE1EB33',
    buttonTextColor: '#FFFFFF',
  };

  constructor(
    private readonly configService: ConfigService,
    @Inject(CONFIG_REPOSITORY_TOKEN)
    private readonly configRepository: IConfigRepository,
  ) {
    this.defaultBucketRegion = this.configService.get<string>(
      'aws.s3.bucketRegion',
      'us-east-1',
    );

    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
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
    const environment = this.configService.get<string>(
      'app.nodeEnv',
      'development',
    );
    const normalizedTenant = tenantName
      ? normalizeTenantName(tenantName, environment)
      : normalizeTenantName('trya', environment);

    // Verifica cache
    const cached = this.brandingCache.get(normalizedTenant);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.branding;
    }

    try {
      // Busca configurações do tenant no DynamoDB
      const themeConfigData = await this.configRepository.getConfig(
        normalizedTenant,
        'theme',
      );
      const bucketConfigData = await this.configRepository.getConfig(
        normalizedTenant,
        'bucketName',
      );

      // Resolve nome do bucket e região
      let bucketName: string | null = null;
      let bucketRegion: string = this.defaultBucketRegion;

      if (bucketConfigData && isBucketConfig(bucketConfigData)) {
        bucketName = bucketConfigData.name;
        bucketRegion = bucketConfigData.region || this.defaultBucketRegion;
      } else if (bucketConfigData && typeof bucketConfigData === 'string') {
        bucketName = bucketConfigData as unknown as string;
      } else if (bucketConfigData && 'name' in bucketConfigData) {
        bucketName = String(bucketConfigData.name);
        // Tenta extrair região se existir
        if (
          'region' in bucketConfigData &&
          typeof bucketConfigData.region === 'string'
        ) {
          bucketRegion = bucketConfigData.region;
        }
      }

      if (!bucketName) {
        this.logger.warn(
          `Bucket não configurado para tenant ${normalizedTenant}, usando fallback`,
        );
        return this.getDefaultBrandingAsync();
      }

      // Extrai informações do tema
      let tenantDisplayName = this.defaultBranding.tenantDisplayName;
      let primaryColor = this.defaultBranding.primaryColor;

      if (themeConfigData && isThemeConfig(themeConfigData)) {
        tenantDisplayName = this.getTenantDisplayName(normalizedTenant);
        primaryColor = themeConfigData.primaryColor || primaryColor;
      }

      // Usa URL S3 direta (CloudFront não serve pasta /e/)
      const bannerSrc = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/e/b_${normalizedTenant}.png`;
      const iconImportantSrc = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/e/i_${normalizedTenant}.png`;

      this.logger.log(`Email branding for tenant ${normalizedTenant}:`);
      this.logger.log(`  Bucket: ${bucketName} (${bucketRegion})`);
      this.logger.log(`  Banner: ${bannerSrc}`);
      this.logger.log(`  Icon: ${iconImportantSrc}`);

      const branding: EmailBranding = {
        bannerSrc,
        iconImportantSrc,
        tenantDisplayName,
        platformName: this.getPlatformName(normalizedTenant),
        primaryColor,
        primaryColorLight: this.lightenColor(primaryColor, 0.2),
        buttonTextColor: this.getContrastColor(primaryColor),
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
   * Retorna o branding padrão (Trya)
   */
  private async getDefaultBrandingAsync(): Promise<EmailBranding> {
    const cached = this.brandingCache.get('_default');
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.branding;
    }

    // Tenta buscar assets padrão do bucket trya-assets
    const env = this.configService.get<string>('app.nodeEnv', 'development');
    const envSuffix =
      env === 'production' ? 'prod' : env === 'staging' ? 'hml' : 'dev';
    const defaultBucket = `trya-assets-${envSuffix}`;

    // Banner: tenta SVG primeiro, depois PNG
    let bannerSrc = await this.downloadAsBase64Async(
      defaultBucket,
      'public/email/banner_trya.svg',
    );
    if (!bannerSrc) {
      bannerSrc = await this.downloadAsBase64Async(
        defaultBucket,
        'public/email/banner_trya.png',
      );
    }

    // Avatar/Icon: tenta SVG primeiro, depois PNG
    let iconImportantSrc = await this.downloadAsBase64Async(
      defaultBucket,
      'public/email/avatar_trya.svg',
    );
    if (!iconImportantSrc) {
      iconImportantSrc = await this.downloadAsBase64Async(
        defaultBucket,
        'public/email/avatar_trya.png',
      );
    }

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
      const s3Client = this.getS3ClientForRegion(
        region || this.defaultBucketRegion,
      );

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
   * Retorna o nome de exibição do tenant
   */
  private getTenantDisplayName(tenantSlug: string): string {
    const displayNames: Record<string, string> = {
      grupotrigo: 'Grupo Trigo',
      trigoinvestimentos: 'Grupo Trigo',
      'trigo-investimentos': 'Grupo Trigo',
      trya: 'Trya',
    };

    return displayNames[tenantSlug] || tenantSlug;
  }

  /**
   * Retorna o nome da plataforma para o rodapé do email
   */
  private getPlatformName(tenantSlug: string): string {
    const platformNames: Record<string, string> = {
      grupotrigo: 'Trya Saúde',
      trya: 'Trya Saúde',
    };

    return platformNames[tenantSlug] || 'Trya Saúde';
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
