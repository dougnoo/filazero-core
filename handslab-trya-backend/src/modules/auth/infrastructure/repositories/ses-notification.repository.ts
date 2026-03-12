import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { INotificationRepository } from '../../../../shared/domain/repositories/notification.repository.interface';
import { EmailTemplateService } from '../templates/email-template.service';
import { EmailBrandingService } from '../services/email-branding.service';

/**
 * Implementação do repositório de notificações usando AWS SES
 *
 * Características:
 * - Envia emails profissionais via AWS SES
 * - Templates HTML responsivos
 * - Suporta personalização multi-tenant (branding por tenant)
 * - Tratamento de erros robusto
 *
 * Configuração necessária:
 * - Email remetente verificado no SES
 * - Permissões IAM para ses:SendEmail
 * - Região AWS configurada
 *
 * Variáveis de ambiente:
 * - AWS_REGION: Região da AWS (ex: us-east-1)
 * - SES_FROM_EMAIL: Email remetente verificado
 * - SES_FROM_NAME: Nome do remetente (opcional)
 * - AWS_ACCESS_KEY_ID: Credenciais AWS (opcional se usar IAM Role)
 * - AWS_SECRET_ACCESS_KEY: Credenciais AWS (opcional se usar IAM Role)
 */
@Injectable()
export class SesNotificationRepository implements INotificationRepository {
  private readonly logger = new Logger(SesNotificationRepository.name);
  private readonly client: SESClient;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly emailBrandingService: EmailBrandingService,
  ) {
    const region = this.configService.get<string>(
      'aws.ses.region',
      'us-east-1',
    );
    this.fromEmail = this.configService.get<string>(
      'aws.ses.fromEmail',
      'noreply@trya.health',
    );
    this.fromName = this.configService.get<string>(
      'aws.ses.fromName',
      'HandsLab',
    );

    // Obter credenciais opcionais da configuração
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    // Criar cliente SES
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

    // Pré-carregar templates para melhor performance
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

    try {
      const fromName = await this.getFromName(tenantName);
      const command = new SendEmailCommand({
        Source: `${fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: [email],
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

      this.logger.log(
        `Email OTP enviado com sucesso para ${email} (tenant: ${tenantName || 'default'})`,
      );
    } catch (error) {
      this.logger.error(`Erro ao enviar email OTP para ${email}:`, error);
      throw new Error(
        `Falha ao enviar email: ${(error as Error).message || 'Erro desconhecido'}`,
      );
    }
  }

  async sendOtpSms(phoneNumber: string, otp: string): Promise<void> {
    // SMS via SNS pode ser implementado aqui
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

    try {
      const fromName = await this.getFromName(tenantName);
      const command = new SendEmailCommand({
        Source: `${fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: [email],
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

      this.logger.log(
        `Email de redefinição de senha enviado com sucesso para ${email} (tenant: ${tenantName || 'default'})`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar email de redefinição para ${email}:`,
        error,
      );
      throw new Error(
        `Falha ao enviar email: ${(error as Error).message || 'Erro desconhecido'}`,
      );
    }
  }

  async sendWelcomeAdminEmail(
    email: string,
    userName: string,
    userRole: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<void> {
    const fromName = await this.getFromName(tenantName);
    const subject = `Bem-vindo(a) ao ${fromName}!`;

    const htmlBody =
      await this.emailTemplateService.getWelcomeAdminEmailHtmlAsync(
        userName,
        email,
        userRole,
        tenantName,
        temporaryPassword,
        loginUrl,
      );
    const textBody =
      await this.emailTemplateService.getWelcomeAdminEmailTextAsync(
        userName,
        email,
        userRole,
        tenantName,
        temporaryPassword,
        loginUrl,
      );

    try {
      const command = new SendEmailCommand({
        Source: `${fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: [email],
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

      this.logger.log(
        `Email de boas-vindas enviado com sucesso para ${email} (${userName})`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar email de boas-vindas para ${email}:`,
        error,
      );
      throw new Error(
        `Falha ao enviar email: ${(error as Error).message || 'Erro desconhecido'}`,
      );
    }
  }

  async sendWelcomeBeneficiaryEmail(
    email: string,
    userName: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<void> {
    const fromName = await this.getFromName(tenantName);
    const subject = `Boas-vindas ao hub de saúde do ${fromName}!`;

    const htmlBody =
      await this.emailTemplateService.getWelcomeBeneficiaryEmailHtmlAsync(
        userName,
        email,
        tenantName,
        temporaryPassword,
        loginUrl,
      );
    const textBody =
      await this.emailTemplateService.getWelcomeBeneficiaryEmailTextAsync(
        userName,
        email,
        tenantName,
        temporaryPassword,
        loginUrl,
      );

    try {
      const command = new SendEmailCommand({
        Source: `${fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: [email],
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

      this.logger.log(
        `Email de boas-vindas para beneficiário enviado com sucesso para ${email} (${userName})`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar email de boas-vindas para beneficiário ${email}:`,
        error,
      );
      throw new Error(
        `Falha ao enviar email: ${(error as Error).message || 'Erro desconhecido'}`,
      );
    }
  }

  async sendWelcomeDoctorEmail(
    email: string,
    userName: string,
    tenantName: string,
    temporaryPassword: string,
    loginUrl: string,
    crm?: string,
    specialty?: string,
  ): Promise<void> {
    const fromName = await this.getFromName(tenantName);
    const subject = `Bem-vindo ao ${fromName} - Dr. ${userName}!`;

    const htmlBody =
      await this.emailTemplateService.getWelcomeDoctorEmailHtmlAsync(
        userName,
        email,
        tenantName,
        temporaryPassword,
        loginUrl,
        crm,
        specialty,
      );
    const textBody =
      await this.emailTemplateService.getWelcomeDoctorEmailTextAsync(
        userName,
        email,
        tenantName,
        temporaryPassword,
        loginUrl,
        crm,
        specialty,
      );

    try {
      const command = new SendEmailCommand({
        Source: `${fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: [email],
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

      this.logger.log(
        `Email de boas-vindas para médico enviado com sucesso para ${email} (${userName})`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar email de boas-vindas para médico ${email}:`,
        error,
      );
      throw new Error(
        `Falha ao enviar email: ${(error as Error).message || 'Erro desconhecido'}`,
      );
    }
  }

  async sendContactEmail(
    toEmail: string,
    fromEmail: string,
    fromName: string,
    tenantId: string,
    subject: string,
    message: string,
  ): Promise<void> {
    const emailSubject = `[Contato] ${subject}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Mensagem de Contato</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #062424; border-bottom: 2px solid #062424; padding-bottom: 10px;">
      Nova mensagem de contato
    </h2>
    
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 5px 0;"><strong>De:</strong> ${fromName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${fromEmail}</p>
      <p style="margin: 5px 0;"><strong>Tenant ID:</strong> ${tenantId}</p>
      <p style="margin: 5px 0;"><strong>Assunto:</strong> ${subject}</p>
    </div>
    
    <h3 style="color: #062424;">Mensagem:</h3>
    <div style="background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
      <p style="white-space: pre-wrap;">${message}</p>
    </div>
    
    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #666;">
      Esta mensagem foi enviada através da plataforma Trya.
    </p>
  </div>
</body>
</html>
    `.trim();

    const textBody = `
Nova mensagem de contato

De: ${fromName}
Email: ${fromEmail}
Tenant ID: ${tenantId}
Assunto: ${subject}

Mensagem:
${message}

---
Esta mensagem foi enviada através da plataforma Trya.
    `.trim();

    try {
      const command = new SendEmailCommand({
        Source: `${this.fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: [toEmail],
        },
        ReplyToAddresses: [fromEmail],
        Message: {
          Subject: {
            Data: emailSubject,
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

      this.logger.log(
        `Email de contato enviado com sucesso de ${fromEmail} para ${toEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar email de contato de ${fromEmail} para ${toEmail}:`,
        error,
      );
      throw new Error(
        `Falha ao enviar email: ${(error as Error).message || 'Erro desconhecido'}`,
      );
    }
  }

  /**
   * Obtém o nome do remetente dinamicamente baseado no tenant
   * Se houver tenantName, usa o tenantDisplayName do branding
   * Caso contrário, usa o fromName padrão da configuração
   */
  private async getFromName(tenantName?: string): Promise<string> {
    if (!tenantName) {
      return this.fromName;
    }

    try {
      const branding = await this.emailBrandingService.getBrandingAsync(tenantName);
      return branding.tenantDisplayName || this.fromName;
    } catch (error) {
      this.logger.warn(
        `Erro ao obter branding para tenant ${tenantName}, usando nome padrão:`,
        error,
      );
      return this.fromName;
    }
  }

  /**
   * Método auxiliar para verificar se o SES está configurado
   * Útil para health checks
   */
  async healthCheck(): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      this.logger.error('Health check do SES falhou:', error);
      return false;
    }
  }
}
