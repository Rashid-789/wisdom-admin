import React from "react";
import { RefreshCw, CheckCheck } from "lucide-react";
import type { NotificationItem } from "./notifications.types";
import NotificationRow from "../notifications/NotificationRow";
import { cn } from "../app/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;

  loading: boolean;
  items: NotificationItem[];

  onMarkAllRead: () => Promise<void>;
  onMarkRead: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
};

export default function NotificationsPopover({
  open,
  onClose,
  loading,
  items,
  onMarkAllRead,
  onMarkRead,
  onRemove,
  onRefresh,
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = React.useState(false);

  // Close on click outside
  React.useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose]);

  // Close on ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Notifications"
      className={cn(
        "z-50",
        // Mobile/tablet: fixed full-width popover so it never overflows the viewport
        "fixed inset-x-2 top-[72px] w-auto",
        // Desktop: keep your original anchored dropdown behavior
        "sm:absolute sm:right-0 sm:top-[52px] sm:w-[360px]",
        // Keep safe max widths everywhere
        "max-w-[calc(100vw-1rem)] sm:max-w-[90vw]"
      )}
    >
      {/* little caret (desktop only) */}
      <div className="absolute right-3 top-[-6px] hidden h-3 w-3 rotate-45 border-l border-t border-slate-200 bg-white sm:block" />

      <div
        className={cn(
          "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl",
          // Mobile: ensure it fits the available height and doesn't go off-screen
          "max-h-[calc(100dvh-84px)]"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">Notifications</p>
            <p className="truncate text-xs text-slate-500">
              Latest updates from your platform
            </p>
          </div>

          <div className="flex flex-none items-center gap-2">
            <button
              type="button"
              className={cn(
                "grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                (busy || loading) && "pointer-events-none opacity-60"
              )}
              onClick={async () => {
                setBusy(true);
                try {
                  await onRefresh();
                } finally {
                  setBusy(false);
                }
              }}
              aria-label="Refresh notifications"
            >
              <RefreshCw size={16} />
            </button>

            <button
              type="button"
              className={cn(
                "grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                (busy || loading || items.length === 0) && "pointer-events-none opacity-60"
              )}
              onClick={async () => {
                setBusy(true);
                try {
                  await onMarkAllRead();
                } finally {
                  setBusy(false);
                }
              }}
              aria-label="Mark all as read"
            >
              <CheckCheck size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className={cn(
            "overflow-y-auto overscroll-contain p-2",
            // Mobile: allow the list to use remaining viewport height
            "max-h-[calc(100dvh-220px)] sm:max-h-[380px]"
          )}
        >
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 p-3">
                  <div className="h-3 w-2/3 rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm font-semibold text-slate-900">You’re all caught up</p>
              <p className="mt-1 text-sm text-slate-500">
                No new notifications right now.
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {items.map((n) => (
                <NotificationRow
                  key={n.id}
                  item={n}
                  onMarkRead={onMarkRead}
                  onRemove={onRemove}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
