import { Injectable, Inject } from '@nestjs/common';
import type { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../domain/interfaces/notification.repository.interface';

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.markAsRead(notificationId, userId);
  }
}
