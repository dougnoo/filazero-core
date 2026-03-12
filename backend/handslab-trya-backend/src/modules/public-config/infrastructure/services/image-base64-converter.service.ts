import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class ImageBase64ConverterService {
  private readonly logger = new Logger(ImageBase64ConverterService.name);
  private readonly defaultBucketName: string;
  private readonly defaultBucketRegion: string;
  private readonly s3ClientsCache: Map<string, S3Client> = new Map();
  private readonly credentials: any;

  constructor(private readonly configService: ConfigService) {
    this.defaultBucketName =
      this.configService.get<string>('aws.s3.bucketName')!;
    this.defaultBucketRegion = this.configService.get<string>(
      'aws.s3.bucketRegion',
    )!;

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
   * Converte uma URL de imagem ou chave S3 para base64
   * Se já for base64, retorna como está
   *
   * @param fileName - Nome do arquivo (ex: "logo.png") ou base64 data URI
   * @param tenantName - Nome do tenant
   * @param bucketName - Nome do bucket
   * @param bucketRegion - Região do bucket (opcional)
   * @param imageType - Tipo da imagem ('logo', 'favicon', 'loginBackground')
   */
  async convertToBase64(
    fileName: string,
    tenantName?: string,
    bucketName?: string,
    bucketRegion?: string,
    imageType?: string,
  ): Promise<string> {
    // Se já for base64, retorna como está
    if (this.isBase64DataUri(fileName)) {
      return fileName;
    }

    // Se não fornecer fileName, retorna vazio
    if (!fileName) {
      return '';
    }

    // Se não fornecer tenantName e bucketName, retorna vazio
    if (!tenantName || !bucketName) {
      this.logger.warn(
        `Faltando informações para buscar arquivo: tenantName=${tenantName}, bucketName=${bucketName}`,
      );
      return '';
    }

    // Constrói a chave S3 com base no tipo de imagem
    const s3Key = this.buildS3Key(fileName, tenantName, imageType);

    return await this.s3KeyToBase64(s3Key, undefined, bucketName, bucketRegion);
  }

  /**
   * Constrói a chave S3 com base no tipo de imagem
   */
  private buildS3Key(
    fileName: string,
    tenantName: string,
    imageType?: string,
  ): string {
    // Determina a pasta baseado no tipo
    let folder = 'images';
    if (
      imageType === 'logo' ||
      imageType === 'loginBackground' ||
      imageType === 'favicon' ||
      imageType === 'bannerDashboard'
    ) {
      folder = 'theme';
    }

    //return `${tenantName}/${folder}/${fileName}`;
    return `${folder}/${fileName}`;
  }

  /**
   * Verifica se a string é um data URI base64
   */
  private isBase64DataUri(str: string): boolean {
    return /^data:image\/(png|jpg|jpeg|gif|svg\+xml|webp);base64,/.test(str);
  }

  /**
   * Extrai a chave S3 de uma URL
   * Exemplo: https://bucket.s3.region.amazonaws.com/path/to/file.png -> path/to/file.png
   */
  private extractS3KeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove o primeiro '/' do pathname
      return urlObj.pathname.substring(1);
    } catch (error) {
      this.logger.error(`Erro ao extrair chave S3 da URL: ${url}`, error);
      return url;
    }
  }

  /**
   * Converte URL S3 para base64
   */
  private async s3UrlToBase64(
    url: string,
    bucketName?: string,
  ): Promise<string> {
    const key = this.extractS3KeyFromUrl(url);
    return await this.s3KeyToBase64(key, undefined, bucketName);
  }

  /**
   * Baixa arquivo do S3 e converte para base64
   * @param key - Chave S3 completa (ex: "tenant-name/logos/logo.png")
   * @param tenantName - Nome do tenant (para compatibilidade)
   * @param bucketName - Nome do bucket
   * @param bucketRegion - Região do bucket (se não fornecido, usa a padrão)
   */
  private async s3KeyToBase64(
    key: string,
    tenantName?: string,
    bucketName?: string,
    bucketRegion?: string,
  ): Promise<string> {
    try {
      // A chave pode já vir completa (do buildS3Key) ou não
      let fullKey = key;

      // Se o tenant foi fornecido e a chave não tem estrutura de pasta, adiciona como prefixo
      // Isso mantém compatibilidade com outros usos do método
      if (tenantName && !key.includes('/')) {
        fullKey = `${tenantName}/${key}`;
      }

      // Usa o bucketName fornecido ou o default da configuração
      const bucket = bucketName || this.defaultBucketName;

      // Usa a região fornecida ou a padrão da configuração
      const region = bucketRegion || this.defaultBucketRegion;

      // Obtém ou cria um S3Client para a região específica
      const s3Client = this.getS3ClientForRegion(region);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: fullKey,
      });

      const response = await s3Client.send(command);

      if (!response.Body) {
        this.logger.warn(`Arquivo vazio no S3: ${fullKey}`);
        return '';
      }

      // Converte stream para buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString('base64');

      // Determina o tipo MIME
      const contentType =
        response.ContentType || this.getMimeTypeFromKey(fullKey);

      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      this.logger.error(`Erro ao baixar arquivo do S3: ${key}`, error);
      return '';
    }
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
}
