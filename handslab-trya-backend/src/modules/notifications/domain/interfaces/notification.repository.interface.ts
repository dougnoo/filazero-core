export interface INotificationRepository {
  findBySessionAndCategory(
    sessionId: string,
    category: string,
  ): Promise<boolean>;
  create(userId: string, category: string, sessionId: string): Promise<void>;
  findByUserId(userId: string): Promise<
    Array<{
      id: string;
      category: string;
      sessionId: string;
      read: boolean;
      createdAt: Date;
    }>
  >;
  findLatestUnreadByUserId(userId: string): Promise<{
    id: string;
    category: string;
    sessionId: string;
    read: boolean;
    createdAt: Date;
  } | null>;
  markAsRead(notificationId: string, userId: string): Promise<void>;
}

export const NOTIFICATION_REPOSITORY_TOKEN = 'NOTIFICATION_REPOSITORY_TOKEN';
