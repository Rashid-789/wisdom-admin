import type { NotificationItem } from "./notifications.types";

/**
 * Firebase mapping (later):
 * - Collection: /admin_notifications (or /users/{adminId}/notifications)
 * - Query: orderBy(createdAt desc), limit(20)
 * - Mark read: updateDoc
 * - Remove: deleteDoc
 */

const seed: NotificationItem[] = [
  {
    id: "n1",
    type: "payment",
    title: "New payment received",
    message: "A user purchased a plan (PKR 1,500).",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    href: "/admin/payments/transactions",
  },
  {
    id: "n2",
    type: "content",
    title: "Lecture uploaded",
    message: "A new lecture was added to Applied Mathematics.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: false,
    href: "/admin/content/lectures",
  },
  {
    id: "n3",
    type: "live_class",
    title: "Live class scheduled",
    message: "Tomorrow 8:00 PM — Applied Mathematics (Calculus).",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    read: true,
    href: "/admin/live-classes",
  },
];

let memoryDb = [...seed];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  await sleep(250);
  // newest first
  return [...memoryDb].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function markNotificationRead(id: string): Promise<void> {
  await sleep(120);
  memoryDb = memoryDb.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export async function markAllNotificationsRead(): Promise<void> {
  await sleep(160);
  memoryDb = memoryDb.map((n) => ({ ...n, read: true }));
}

export async function removeNotification(id: string): Promise<void> {
  await sleep(120);
  memoryDb = memoryDb.filter((n) => n.id !== id);
}
