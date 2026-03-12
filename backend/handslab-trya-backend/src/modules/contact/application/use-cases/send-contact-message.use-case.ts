import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../shared/domain/repositories/notification.repository.token';
import type { INotificationRepository } from '../../../../shared/domain/repositories/notification.repository.interface';
import { SendContactMessageDto } from '../../presentation/dtos/send-contact-message.dto';

export interface SendContactMessageInput {
  dto: SendContactMessageDto;
  userName: string;
  userEmail: string;
  tenantId: string;
}

@Injectable()
export class SendContactMessageUseCase {
  private readonly logger = new Logger(SendContactMessageUseCase.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(input: SendContactMessageInput): Promise<{ success: boolean }> {
    const { dto, userName, userEmail, tenantId } = input;

    const toEmail = this.configService.get<string>(
      'app.contact.toEmail',
      'contato@trya.health',
    );

    this.logger.log(
      `Enviando mensagem de contato de ${userName} <${userEmail}> (tenant: ${tenantId}) para ${toEmail}`,
    );

    try {
      await this.notificationRepository.sendContactEmail(
        toEmail,
        userEmail,
        userName,
        tenantId,
        dto.subject,
        dto.message,
      );

      this.logger.log(
        `Mensagem de contato enviada com sucesso de ${userEmail} para ${toEmail}`,
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Erro ao enviar mensagem de contato de ${userEmail}:`,
        error,
      );
      throw error;
    }
  }
}
