import React from "react";
import type { NotificationItem } from "./notifications.types";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  removeNotification as apiRemove,
} from "./notifications.api";

export function useNotifications() {
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const unreadCount = React.useMemo(
    () => items.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [items]
  );

  const markRead = React.useCallback(async (id: string) => {
    // optimistic UI
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markNotificationRead(id);
    } catch {
      // rollback if needed
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      throw new Error("Failed to mark as read");
    }
  }, []);

  const markAllRead = React.useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      // if failed, re-fetch to be safe
      await refresh();
      throw new Error("Failed to mark all as read");
    }
  }, [refresh]);

  const removeNotification = React.useCallback(async (id: string) => {
    const snapshot = items;
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiRemove(id);
    } catch {
      setItems(snapshot);
      throw new Error("Failed to remove notification");
    }
  }, [items]);

  return {
    items,
    loading,
    unreadCount,
    refresh,
    markRead,
    markAllRead,
    removeNotification,
  };
}
