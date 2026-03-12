import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  notificationService,
  type Notification,
} from "../services/notificationService";

const POLLING_INTERVAL = 60000; // 1 minuto

export const useNotifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate unread count
  const count = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Mark as read
      if (!notification.read) {
        await markAsRead(notification.id);
      }

      // Redirect to triage if sessionId exists
      if (notification.sessionId) {
        const tenant = new URLSearchParams(window.location.search).get(
          "tenant"
        );
        const triageUrl = tenant
          ? `/paciente/triagem?session_id=${notification.sessionId}&tenant=${tenant}`
          : `/paciente/triagem?session_id=${notification.sessionId}`;
        router.push(triageUrl);
      }
    },
    [markAsRead, router]
  );

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling
  useEffect(() => {
    const interval = setInterval(async () => {
      const latestUnread = await notificationService.getLatestUnread();
      // Only add if latestUnread exists and has an id
      if (latestUnread && latestUnread.id) {
        // Check if this notification is already in the list
        const exists = notifications.some((n) => n.id === latestUnread.id);
        if (!exists) {
          // Add new notification to the beginning of the list
          setNotifications((prev) => [latestUnread, ...prev]);
        }
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [notifications]);

  return {
    notifications,
    count,
    isLoading,
    markAsRead,
    handleNotificationClick,
    refetch: fetchNotifications,
  };
};
