export type NotificationType =
  | "system"
  | "payment"
  | "content"
  | "live_class"
  | "user";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  href?: string; // later: navigate to page
  createdAt: string; // ISO string
  read: boolean;
};
