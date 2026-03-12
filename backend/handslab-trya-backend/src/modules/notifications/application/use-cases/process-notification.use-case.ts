import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../domain/interfaces/notification.repository.interface';
import type {
  ITriageSessionRepository,
  AttachmentData,
} from '../../domain/interfaces/triage-session.repository.interface';
import { TRIAGE_SESSION_REPOSITORY_TOKEN } from '../../domain/interfaces/triage-session.repository.interface';
import { NotificationCategory } from '../../domain/enums/notification-category.enum';

interface TriageFinishedData {
  sessionId: string;
  doctorName: string;
  attachments: AttachmentData[];
}

@Injectable()
export class ProcessNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
    @Inject(TRIAGE_SESSION_REPOSITORY_TOKEN)
    private readonly triageSessionRepository: ITriageSessionRepository,
  ) {}

  async execute(category: string, data: any): Promise<void> {
    if (category === NotificationCategory.TRIAGE_FINISHED) {
      await this.handleTriageFinished(category, data);
    }
  }

  private async handleTriageFinished(
    category: string,
    data: TriageFinishedData,
  ): Promise<void> {
    const { sessionId, attachments, doctorName } = data;

    const exists = await this.notificationRepository.findBySessionAndCategory(
      sessionId,
      category,
    );
    if (exists) {
      return;
    }

    const sessionData =
      await this.triageSessionRepository.findUserIdBySession(sessionId);
    if (!sessionData) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    await this.notificationRepository.create(
      sessionData.userId,
      category,
      sessionId,
    );
    await this.triageSessionRepository.completeSession(
      sessionId,
      attachments,
      doctorName,
    );
  }
}
