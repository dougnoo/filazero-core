import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { EmailTemplateService } from '../services/email-template.service';

@Injectable()
export class SesNotificationRepository implements INotificationRepository {
  private readonly logger = new Logger(SesNotificationRepository.name);
  private readonly client: SESClient;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.fromEmail = this.configService.get<string>(
      'AWS_SES_FROM_EMAIL',
      'noreply@trya.com.br',
    );
    this.fromName = this.configService.get<string>('AWS_SES_FROM_NAME', 'Trya');

    const profile = this.configService.get<string>('AWS_PROFILE');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    this.client = new SESClient({
      region,
      ...(profile ? { profile } : {}),
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });

    this.emailTemplateService.preloadTemplates();

    this.logger.log(
      `SES Notification Repository inicializado - From: ${this.fromName} <${this.fromEmail}>, Região: ${region}`,
    );
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    userName?: string,
    tenantName?: string,
  ): Promise<void> {
    const greeting = userName || 'Olá';
    const subject = 'Primeiro acesso à plataforma';

    const htmlBody = await this.emailTemplateService.getOtpEmailHtmlAsync(
      otp,
      greeting,
      tenantName,
    );
    const textBody = await this.emailTemplateService.getOtpEmailTextAsync(
      otp,
      greeting,
      tenantName,
    );

    await this.sendEmail(email, subject, htmlBody, textBody);
    this.logger.log(
      `Email OTP enviado com sucesso para ${email} (tenant: ${tenantName || 'default'})`,
    );
  }

  async sendOtpSms(phoneNumber: string, otp: string): Promise<void> {
    this.logger.warn(
      `Envio de SMS não implementado. Telefone: ${phoneNumber}, OTP: ${otp}`,
    );
    throw new Error('Envio de SMS não implementado');
  }

  async sendPasswordResetEmail(
    email: string,
    otp: string,
    tenantName?: string,
  ): Promise<void> {
    const greeting = 'Olá';
    const subject = 'Redefina sua senha';

    const htmlBody =
      await this.emailTemplateService.getPasswordResetEmailHtmlAsync(
        otp,
        greeting,
        tenantName,
      );
    const textBody =
      await this.emailTemplateService.getPasswordResetEmailTextAsync(
        otp,
        greeting,
        tenantName,
      );

    await this.sendEmail(email, subject, htmlBody, textBody);
    this.logger.log(
      `Email de redefinição de senha enviado com sucesso para ${email} (tenant: ${tenantName || 'default'})`,
    );
  }

  async sendWelcomeAdminEmail(
    email: string,
    userName: string,
    userRole: string,
    temporaryPassword: string,
    loginUrl: string,
    tenantName?: string,
  ): Promise<void> {
    const subject = 'Bem-vindo à plataforma Trya';

    const htmlBody =
      await this.emailTemplateService.getWelcomeAdminEmailHtmlAsync(
        email,
        userName,
        userRole,
        temporaryPassword,
        loginUrl,
        tenantName,
      );
    const textBody =
      await this.emailTemplateService.getWelcomeAdminEmailTextAsync(
        email,
        userName,
        userRole,
        temporaryPassword,
        loginUrl,
        tenantName,
      );

    await this.sendEmail(email, subject, htmlBody, textBody);
    this.logger.log(`Email de boas-vindas enviado com sucesso para ${email}`);
  }

  async sendWelcomeDoctorEmail(
    email: string,
    userName: string,
    temporaryPassword: string,
    loginUrl: string,
    crm?: string,
    specialty?: string,
    tenantName?: string,
  ): Promise<void> {
    const subject = 'Bem-vindo à plataforma Trya';

    const htmlBody =
      await this.emailTemplateService.getWelcomeDoctorEmailHtmlAsync(
        userName,
        temporaryPassword,
        loginUrl,
        crm,
        specialty,
        tenantName,
      );
    const textBody =
      await this.emailTemplateService.getWelcomeDoctorEmailTextAsync(
        userName,
        temporaryPassword,
        loginUrl,
        crm,
        specialty,
        tenantName,
      );

    await this.sendEmail(email, subject, htmlBody, textBody);
    this.logger.log(
      `Email de boas-vindas para médico enviado com sucesso para ${email}`,
    );
  }

  private async sendEmail(
    to: string,
    subject: string,
    htmlBody: string,
    textBody: string,
  ): Promise<void> {
    try {
      const command = new SendEmailCommand({
        Source: `${this.fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.client.send(command);
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${to}:`, error);
      throw new Error(
        `Falha ao enviar email: ${(error as Error).message || 'Erro desconhecido'}`,
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      this.logger.error('Health check do SES falhou:', error);
      return false;
    }
  }
}
