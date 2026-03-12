import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { EmailBrandingService, EmailBranding } from './email-branding.service';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  private readonly templatesPath: string;
  private readonly templateCache = new Map<string, string>();
  private readonly appName: string;
  private readonly assetsBucketName: string;
  private readonly s3Client: S3Client;
  private readonly bannerCache = new Map<
    'welcome' | 'first-login' | 'password-reset',
    string
  >();

  constructor(
    private readonly configService: ConfigService,
    private readonly emailBrandingService: EmailBrandingService,
  ) {
    // Templates are in the templates folder, one level up from services
    this.templatesPath = join(__dirname, '..', 'templates');
    this.appName = this.configService.get<string>('AWS_SES_FROM_NAME', 'Trya');

    const cdnUrl = this.configService.get<string>('ASSETS_CDN_URL', '');
    this.assetsBucketName =
      this.configService.get<string>('TRYA_ASSETS_BUCKET') ||
      (cdnUrl.includes('hml') ? 'broker-tenant-1-hml' : 'broker-tenant-1');

    const region =
      this.configService.get<string>('AWS_REGION') ||
      this.configService.get<string>('AWS_DEFAULT_REGION') ||
      'us-east-1';

    this.s3Client = new S3Client({ region });
  }

  private async getEmailBannerSrcAsync(
    type: 'welcome' | 'first-login' | 'password-reset',
  ): Promise<string> {
    const cached = this.bannerCache.get(type);
    if (cached) return cached;

    const fileNameByType: Record<typeof type, string> = {
      welcome: 'boas-vindas.png',
      'first-login': 'primeiro-acesso.png',
      'password-reset': 'redefinicao-de-senha.png',
    };

    const key = `e/${fileNameByType[type]}`;

    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.assetsBucketName,
          Key: key,
        }),
      );

      if (!response.Body) return '';

      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString('base64');
      const contentType = response.ContentType || 'image/png';

      const dataUri = `data:${contentType};base64,${base64}`;
      this.bannerCache.set(type, dataUri);
      return dataUri;
    } catch {
      return '';
    }
  }

  async getOtpEmailHtmlAsync(
    otp: string,
    greeting: string,
    tenantName?: string,
  ): Promise<string> {
    const template = this.loadTemplate('first-login-email.html');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    const bannerSrc = await this.getEmailBannerSrcAsync('first-login');

    return this.replaceVariables(template, {
      GREETING: greeting,
      OTP_CODE: otp,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      ...this.getBrandingVariables(branding),
      ...(bannerSrc ? { EMAIL_BANNER_SRC: bannerSrc } : {}),
    });
  }

  async getOtpEmailTextAsync(
    otp: string,
    greeting: string,
    tenantName?: string,
  ): Promise<string> {
    const template = this.loadTemplate('first-login-email.txt');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    return this.replaceVariables(template, {
      GREETING: greeting,
      OTP_CODE: otp,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      TENANT_DISPLAY_NAME: branding.tenantDisplayName,
    });
  }

  async getPasswordResetEmailHtmlAsync(
    otp: string,
    greeting: string,
    tenantName?: string,
  ): Promise<string> {
    const template = this.loadTemplate('password-reset-email.html');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    const bannerSrc = await this.getEmailBannerSrcAsync('password-reset');

    return this.replaceVariables(template, {
      GREETING: greeting,
      OTP_CODE: otp,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      ...this.getBrandingVariables(branding),
      ...(bannerSrc ? { EMAIL_BANNER_SRC: bannerSrc } : {}),
    });
  }

  async getPasswordResetEmailTextAsync(
    otp: string,
    greeting: string,
    tenantName?: string,
  ): Promise<string> {
    const template = this.loadTemplate('password-reset-email.txt');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    return this.replaceVariables(template, {
      GREETING: greeting,
      OTP_CODE: otp,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      TENANT_DISPLAY_NAME: branding.tenantDisplayName,
    });
  }

  async getWelcomeAdminEmailHtmlAsync(
    email: string,
    userName: string,
    userRole: string,
    temporaryPassword: string,
    loginUrl: string,
    tenantName?: string,
  ): Promise<string> {
    const template = this.loadTemplate('welcome-admin-email.html');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    const bannerSrc = await this.getEmailBannerSrcAsync('welcome');

    return this.replaceVariables(template, {
      USER_EMAIL: email,
      USER_NAME: userName,
      USER_ROLE: userRole,
      TEMPORARY_PASSWORD: temporaryPassword,
      LOGIN_URL: loginUrl,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      ...this.getBrandingVariables(branding),
      ...(bannerSrc ? { EMAIL_BANNER_SRC: bannerSrc } : {}),
    });
  }

  async getWelcomeAdminEmailTextAsync(
    email: string,
    userName: string,
    userRole: string,
    temporaryPassword: string,
    loginUrl: string,
    tenantName?: string,
  ): Promise<string> {
    const template = this.loadTemplate('welcome-admin-email.txt');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    return this.replaceVariables(template, {
      USER_EMAIL: email,
      USER_NAME: userName,
      USER_ROLE: userRole,
      TEMPORARY_PASSWORD: temporaryPassword,
      LOGIN_URL: loginUrl,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      TENANT_DISPLAY_NAME: branding.tenantDisplayName,
    });
  }

  async getWelcomeDoctorEmailHtmlAsync(
    userName: string,
    temporaryPassword: string,
    loginUrl: string,
    crm?: string,
    specialty?: string,
    tenantName?: string,
  ): Promise<string> {
    const template = this.loadTemplate('welcome-doctor-email.html');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    // Prepara os blocos condicionais de CRM e especialidade
    const crmRow = crm
      ? `<tr class="info-row"><td>CRM: <span class="info-value">${crm}</span></td></tr>`
      : '';
    const specialtyRow = specialty
      ? `<tr class="info-row info-row-last"><td>Especialidade: <span class="info-value">${specialty}</span></td></tr>`
      : '';

    const bannerSrc = await this.getEmailBannerSrcAsync('welcome');

    return this.replaceVariables(template, {
      USER_NAME: userName,
      USER_EMAIL: '', // Será preenchido pelo caller se necessário
      CRM_ROW: crmRow,
      SPECIALTY_ROW: specialtyRow,
      TEMPORARY_PASSWORD: temporaryPassword,
      LOGIN_URL: loginUrl,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      ...this.getBrandingVariables(branding),
      ...(bannerSrc ? { EMAIL_BANNER_SRC: bannerSrc } : {}),
    });
  }

  async getWelcomeDoctorEmailTextAsync(
    userName: string,
    temporaryPassword: string,
    loginUrl: string,
    crm?: string,
    specialty?: string,
    tenantName?: string,
  ): Promise<string> {
    const template = this.loadTemplate('welcome-doctor-email.txt');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    return this.replaceVariables(template, {
      USER_NAME: userName,
      USER_EMAIL: '',
      CRM_INFO: crm ? `CRM: ${crm}` : '',
      SPECIALTY_INFO: specialty ? `Especialidade: ${specialty}` : '',
      TEMPORARY_PASSWORD: temporaryPassword,
      LOGIN_URL: loginUrl,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      TENANT_DISPLAY_NAME: branding.tenantDisplayName,
    });
  }

  /**
   * Converte branding para variáveis de template
   */
  private getBrandingVariables(
    branding: EmailBranding,
  ): Record<string, string> {
    this.logger.log(`Converting branding to template variables:`);
    this.logger.log(`  bannerSrc: ${branding.bannerSrc || '(empty)'}`);
    this.logger.log(`  iconImportantSrc: ${branding.iconImportantSrc || '(empty)'}`);
    this.logger.log(`  tenantDisplayName: ${branding.tenantDisplayName}`);
    
    return {
      EMAIL_BANNER_SRC: branding.bannerSrc,
      EMAIL_ICON_IMPORTANT_SRC: branding.iconImportantSrc,
      TENANT_DISPLAY_NAME: branding.tenantDisplayName,
      PRIMARY_COLOR: branding.primaryColor,
      PRIMARY_COLOR_LIGHT: branding.primaryColorLight,
      BUTTON_TEXT_COLOR: branding.buttonTextColor,
    };
  }

  private loadTemplate(fileName: string): string {
    if (this.templateCache.has(fileName)) {
      return this.templateCache.get(fileName)!;
    }

    try {
      const filePath = join(this.templatesPath, fileName);
      const content = readFileSync(filePath, 'utf-8');
      this.templateCache.set(fileName, content);
      return content;
    } catch (error) {
      throw new Error(
        `Falha ao carregar template ${fileName}: ${(error as Error).message}`,
      );
    }
  }

  private replaceVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }

    return result;
  }

  clearCache(): void {
    this.templateCache.clear();
  }

  preloadTemplates(): void {
    try {
      this.loadTemplate('first-login-email.html');
      this.loadTemplate('first-login-email.txt');
      this.loadTemplate('password-reset-email.html');
      this.loadTemplate('password-reset-email.txt');
      this.loadTemplate('welcome-admin-email.html');
      this.loadTemplate('welcome-admin-email.txt');
      this.loadTemplate('welcome-doctor-email.html');
      this.loadTemplate('welcome-doctor-email.txt');
    } catch {
      // Falha silenciosa
    }
  }
}
