import { api } from './api';

export interface Notification {
  id: string;
  title: string;
  category: string;
  message: string;
  sessionId: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsListResponse {
  notifications: Notification[];
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/api/notifications');
    return response;
  },

  async getLatestUnread(): Promise<Notification | null> {
    try {
      return await api.get<Notification>('/api/notifications/latest-unread');
    } catch {
      return null;
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/api/notifications/${notificationId}/read`);
  },
};
