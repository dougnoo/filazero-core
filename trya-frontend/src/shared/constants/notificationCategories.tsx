import AssignmentIcon from "@mui/icons-material/Assignment";
import NotificationsIcon from "@mui/icons-material/Notifications";

export interface NotificationCategoryConfig {
  icon: React.ComponentType<{ sx?: any }>;
  iconStyle?: "outlined" | "filled";
  defaultTitle?: string;
}

export const NOTIFICATION_CATEGORIES: Record<
  string,
  NotificationCategoryConfig
> = {
  TRIAGE_FINISHED: {
    icon: AssignmentIcon,
    iconStyle: "outlined",
    defaultTitle: "Exame disponível",
  },
  DEFAULT: {
    icon: NotificationsIcon,
    iconStyle: "outlined",
    defaultTitle: "Notificação",
  },
};

/**
 * Get notification category configuration
 * Returns DEFAULT config if category not found
 */
export const getNotificationCategory = (
  category: string
): NotificationCategoryConfig => {
  return NOTIFICATION_CATEGORIES[category] || NOTIFICATION_CATEGORIES.DEFAULT;
};
