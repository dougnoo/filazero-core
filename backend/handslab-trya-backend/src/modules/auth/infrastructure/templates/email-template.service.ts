import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  EmailBrandingService,
  EmailBranding,
} from '../services/email-branding.service';

/**
 * Serviço para gerenciar templates de email
 *
 * Responsabilidades:
 * - Carregar templates de arquivos
 * - Substituir variáveis nos templates
 * - Cachear templates para melhor performance
 * - Integrar branding multi-tenant
 */
@Injectable()
export class EmailTemplateService {
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
    // __dirname já aponta para o diretório templates após a build
    this.templatesPath = __dirname;
    this.appName = this.configService.get<string>('SES_FROM_NAME', 'Trya');
    this.assetsBucketName = this.configService.get<string>(
      'S3_BUCKET_NAME',
      'broker-tenant-1',
    );

    const region =
      this.configService.get<string>('S3_BUCKET_REGION') ||
      this.configService.get<string>('AWS_REGION') ||
      'us-east-1';

    // Usa credential provider chain (IAM Role no ECS / AWS_PROFILE local)
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

  /**
   * Carrega e processa o template HTML de OTP para primeiro login
   */
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

  /**
   * Carrega e processa o template texto de OTP para primeiro login
   */
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

  /**
   * Carrega e processa o template HTML de redefinição de senha
   */
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

  /**
   * Carrega e processa o template texto de redefinição de senha
   */
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

  /**
   * Carrega e processa o template HTML de boas-vindas para admin
   */
  async getWelcomeAdminEmailHtmlAsync(
    userName: string,
    userEmail: string,
    userRole: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<string> {
    const template = this.loadTemplate('welcome-admin-email.html');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    const bannerSrc = await this.getEmailBannerSrcAsync('welcome');

    return this.replaceVariables(template, {
      USER_NAME: userName,
      USER_EMAIL: userEmail,
      USER_ROLE: userRole,
      TEMPORARY_PASSWORD: temporaryPassword,
      LOGIN_URL: loginUrl,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      ...this.getBrandingVariables(branding),
      ...(bannerSrc ? { EMAIL_BANNER_SRC: bannerSrc } : {}),
    });
  }

  /**
   * Carrega e processa o template texto de boas-vindas para admin
   */
  async getWelcomeAdminEmailTextAsync(
    userName: string,
    userEmail: string,
    userRole: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<string> {
    const template = this.loadTemplate('welcome-admin-email.txt');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    return this.replaceVariables(template, {
      USER_NAME: userName,
      USER_EMAIL: userEmail,
      USER_ROLE: userRole,
      TEMPORARY_PASSWORD: temporaryPassword,
      LOGIN_URL: loginUrl,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      TENANT_DISPLAY_NAME: branding.tenantDisplayName,
    });
  }

  /**
   * Carrega e processa o template HTML de boas-vindas para beneficiário
   */
  async getWelcomeBeneficiaryEmailHtmlAsync(
    userName: string,
    userEmail: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<string> {
    const template = this.loadTemplate('welcome-beneficiary-email.html');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    return this.replaceVariables(template, {
      USER_NAME: userName,
      USER_EMAIL: userEmail,
      TEMPORARY_PASSWORD: temporaryPassword,
      LOGIN_URL: loginUrl,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      ...this.getBrandingVariables(branding),
    });
  }

  /**
   * Carrega e processa o template texto de boas-vindas para beneficiário
   */
  async getWelcomeBeneficiaryEmailTextAsync(
    userName: string,
    userEmail: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<string> {
    const template = this.loadTemplate('welcome-beneficiary-email.txt');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    return this.replaceVariables(template, {
      USER_NAME: userName,
      USER_EMAIL: userEmail,
      TEMPORARY_PASSWORD: temporaryPassword,
      LOGIN_URL: loginUrl,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      ...this.getBrandingVariables(branding),
    });
  }

  /**
   * Carrega e processa o template HTML de boas-vindas para médico
   */
  async getWelcomeDoctorEmailHtmlAsync(
    userName: string,
    userEmail: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
    crm?: string,
    specialty?: string,
  ): Promise<string> {
    const template = this.loadTemplate('welcome-doctor-email.html');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    // Prepara os blocos condicionais de CRM e especialidade
    const crmRow = crm
      ? `<tr class="info-row info-row-last"><td>CRM: <span class="info-value">${crm}</span></td></tr>`
      : '';
    const specialtyRow = specialty
      ? `<tr class="info-row info-row-last"><td>Especialidade: <span class="info-value">${specialty}</span></td></tr>`
      : '';

    const bannerSrc = await this.getEmailBannerSrcAsync('welcome');

    return this.replaceVariables(template, {
      USER_NAME: userName,
      USER_EMAIL: userEmail,
      TEMPORARY_PASSWORD: temporaryPassword,
      LOGIN_URL: loginUrl,
      CRM_ROW: crmRow,
      SPECIALTY_ROW: specialtyRow,
      YEAR: new Date().getFullYear().toString(),
      APP_NAME: this.appName,
      ...this.getBrandingVariables(branding),
      ...(bannerSrc ? { EMAIL_BANNER_SRC: bannerSrc } : {}),
    });
  }

  /**
   * Carrega e processa o template texto de boas-vindas para médico
   */
  async getWelcomeDoctorEmailTextAsync(
    userName: string,
    userEmail: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
    crm?: string,
    specialty?: string,
  ): Promise<string> {
    const template = this.loadTemplate('welcome-doctor-email.txt');
    const branding =
      await this.emailBrandingService.getBrandingAsync(tenantName);

    return this.replaceVariables(template, {
      USER_NAME: userName,
      USER_EMAIL: userEmail,
      TEMPORARY_PASSWORD: temporaryPassword,
      LOGIN_URL: loginUrl,
      CRM_INFO: crm ? `CRM: ${crm}` : '',
      SPECIALTY_INFO: specialty ? `Especialidade: ${specialty}` : '',
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
    return {
      EMAIL_BANNER_SRC: branding.bannerSrc,
      EMAIL_ICON_IMPORTANT_SRC: branding.iconImportantSrc,
      TENANT_DISPLAY_NAME: branding.tenantDisplayName,
      PLATFORM_NAME: branding.platformName,
      PRIMARY_COLOR: branding.primaryColor,
      PRIMARY_COLOR_LIGHT: branding.primaryColorLight,
      BUTTON_TEXT_COLOR: branding.buttonTextColor,
    };
  }

  /**
   * Carrega um template do disco (com cache)
   */
  private loadTemplate(fileName: string): string {
    // Verificar cache primeiro
    if (this.templateCache.has(fileName)) {
      return this.templateCache.get(fileName)!;
    }

    // Carregar do disco
    try {
      const filePath = join(this.templatesPath, fileName);
      const content = readFileSync(filePath, 'utf-8');

      // Cachear para próximas chamadas
      this.templateCache.set(fileName, content);

      return content;
    } catch (error) {
      throw new Error(
        `Falha ao carregar template ${fileName}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Substitui variáveis no template
   * Variáveis devem estar no formato {{VARIABLE_NAME}}
   */
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

  /**
   * Limpa o cache de templates
   * Útil em desenvolvimento quando templates são modificados
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Pré-carrega todos os templates no cache
   * Útil para melhorar performance no primeiro envio
   */
  preloadTemplates(): void {
    try {
      this.loadTemplate('first-login-email.html');
      this.loadTemplate('first-login-email.txt');
      this.loadTemplate('password-reset-email.html');
      this.loadTemplate('password-reset-email.txt');
      this.loadTemplate('welcome-admin-email.html');
      this.loadTemplate('welcome-admin-email.txt');
      this.loadTemplate('welcome-beneficiary-email.html');
      this.loadTemplate('welcome-beneficiary-email.txt');
      this.loadTemplate('welcome-doctor-email.html');
      this.loadTemplate('welcome-doctor-email.txt');
    } catch {
      // Falha silenciosa - templates serão carregados sob demanda
    }
  }
}
