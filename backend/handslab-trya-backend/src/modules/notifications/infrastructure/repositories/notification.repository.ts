import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../../../database/entities/notification.entity';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async findBySessionAndCategory(
    sessionId: string,
    category: string,
  ): Promise<boolean> {
    const notification = await this.repository.findOne({
      where: { sessionId, category },
    });
    return !!notification;
  }

  async create(
    userId: string,
    category: string,
    sessionId: string,
  ): Promise<void> {
    const notification = this.repository.create({
      userId,
      category,
      sessionId,
      read: false,
      readAt: null,
    });
    await this.repository.save(notification);
  }

  async findByUserId(userId: string): Promise<
    Array<{
      id: string;
      category: string;
      sessionId: string;
      read: boolean;
      createdAt: Date;
    }>
  > {
    const notifications = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return notifications.map((n) => ({
      id: n.id,
      category: n.category,
      sessionId: n.sessionId,
      read: n.read,
      createdAt: n.createdAt,
    }));
  }

  async findLatestUnreadByUserId(userId: string): Promise<{
    id: string;
    category: string;
    sessionId: string;
    read: boolean;
    createdAt: Date;
  } | null> {
    const notification = await this.repository.findOne({
      where: { userId, read: false },
      order: { createdAt: 'DESC' },
    });

    if (!notification) {
      return null;
    }

    return {
      id: notification.id,
      category: notification.category,
      sessionId: notification.sessionId,
      read: notification.read,
      createdAt: notification.createdAt,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.repository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.read) {
      return;
    }

    notification.read = true;
    notification.readAt = new Date();
    await this.repository.save(notification);
  }
}
