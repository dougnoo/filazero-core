import { Injectable, Inject } from '@nestjs/common';
import { GetBrokerThemeDto } from './get-broker-theme.dto';
import { BrokerThemeResponseDto } from './get-broker-theme-response.dto';
import type { IConfigRepository } from '../../../domain/repositories/config.repository.interface';
import { CONFIG_REPOSITORY_TOKEN } from '../../../domain/repositories/config.repository.token';
import { ConfigService } from '@nestjs/config';
import { ThemeNotFoundError } from '../../../domain/errors/theme-not-found.error';
import { BucketNotConfiguredError } from '../../../domain/errors/bucket-not-configured.error';
import {
  isThemeConfig,
  isBucketConfig,
} from '../../../domain/entities/config-data.entity';
import { normalizeTenantName } from '../../../../../shared/domain/tenant-mapping';

@Injectable()
export class GetBrokerThemeUseCase {
  constructor(
    @Inject(CONFIG_REPOSITORY_TOKEN)
    private readonly configRepository: IConfigRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    getBrokerThemeDto: GetBrokerThemeDto,
  ): Promise<BrokerThemeResponseDto> {
    // Obtém o ambiente atual
    const environment = this.configService.get<string>(
      'app.nodeEnv',
      'development',
    );

    // Normaliza o nome do tenant para o formato canônico (ex: clinica-saude -> clinicasaude)
    // e adiciona sufixo de ambiente se necessário (ex: tenant-1 -> tenant-1-hml em staging)
    const tenantName = normalizeTenantName(
      getBrokerThemeDto.tenantName,
      environment,
    );

    const themeConfigData = await this.configRepository.getConfig(
      tenantName,
      'theme',
    );
    const bucketConfigData = await this.configRepository.getConfig(
      tenantName,
      'bucketName',
    );
    const bucketRegion = this.configService.get<string>('aws.s3.bucketRegion')!;

    if (!themeConfigData || !isThemeConfig(themeConfigData)) {
      throw new ThemeNotFoundError(tenantName);
    }

    const themeConfig = themeConfigData;

    // Obtém o nome do bucket
    let bucketName: string;

    if (bucketConfigData && isBucketConfig(bucketConfigData)) {
      bucketName = bucketConfigData.name;
    } else if (bucketConfigData && typeof bucketConfigData === 'string') {
      // Fallback para string direta (compatibilidade)
      bucketName = bucketConfigData as unknown as string;
    } else if (bucketConfigData && 'name' in bucketConfigData) {
      bucketName = String(bucketConfigData.name);
    } else {
      throw new BucketNotConfiguredError(tenantName);
    }

    if (!bucketName) {
      throw new BucketNotConfiguredError(tenantName);
    }

    // Constrói URL direta do S3 para o bucket do tenant
    // Cada tenant tem seu próprio bucket, então não podemos usar CloudFront compartilhado
    const buildAssetUrl = (file: string) => {
      const clean = file.replace(/^\/+/, '').replace(/^theme\//, '');
      return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/theme/${clean}`;
    };

    const logo = themeConfig.logo ? buildAssetUrl(themeConfig.logo) : '';
    const favicon = themeConfig.favicon
      ? buildAssetUrl(themeConfig.favicon)
      : '';
    const loginBackground = themeConfig.loginBackground
      ? buildAssetUrl(themeConfig.loginBackground)
      : '';
    const bannerDashboard = themeConfig.bannerDashboard
      ? buildAssetUrl(themeConfig.bannerDashboard)
      : '';
    const bannerDashboardMobile = themeConfig.bannerDashboardMobile
      ? buildAssetUrl(themeConfig.bannerDashboardMobile)
      : '';
    const onboardingFinalIllustration = themeConfig.onboardingFinalIllustration
      ? buildAssetUrl(themeConfig.onboardingFinalIllustration)
      : '';

    return {
      theme: {
        name: themeConfig.name,
        primaryColor: themeConfig.primaryColor,
        secondaryColor: themeConfig.secondaryColor,
        backgroundSecondaryColor: themeConfig.backgroundSecondaryColor,
        logo,
        favicon,
        loginBackground,
        bannerDashboard,
        bannerDashboardMobile,
        onboardingFinalIllustration,
      },
    };
  }
}
