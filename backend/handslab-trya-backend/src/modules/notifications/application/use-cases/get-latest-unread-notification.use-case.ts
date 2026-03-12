import { Injectable, Inject } from '@nestjs/common';
import type { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../domain/interfaces/notification.repository.interface';
import { NotificationMessageHelper } from '../helpers/notification-message.helper';

export interface NotificationDto {
  id: string;
  title: string;
  category: string;
  message: string;
  sessionId: string;
  read: boolean;
  createdAt: Date;
}

@Injectable()
export class GetLatestUnreadNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<NotificationDto | null> {
    const notification =
      await this.notificationRepository.findLatestUnreadByUserId(userId);

    if (!notification) {
      return null;
    }

    return {
      id: notification.id,
      title: NotificationMessageHelper.getTitle(notification.category),
      category: notification.category,
      message: NotificationMessageHelper.getMessage(notification.category),
      sessionId: notification.sessionId,
      read: notification.read,
      createdAt: notification.createdAt,
    };
  }
}
