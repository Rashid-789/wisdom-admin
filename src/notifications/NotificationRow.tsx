import React from "react";
import { Trash2 } from "lucide-react";
import type { NotificationItem } from "./notifications.types";
import { timeAgo } from "./notifications.utils";
import { cn } from "../app/utils/cn";

type Props = {
  item: NotificationItem;
  onMarkRead: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};

function typeLabel(type: NotificationItem["type"]) {
  switch (type) {
    case "payment":
      return "Payment";
    case "content":
      return "Content";
    case "live_class":
      return "Live class";
    case "user":
      return "User";
    default:
      return "System";
  }
}

export default function NotificationRow({ item, onMarkRead, onRemove }: Props) {
  const [busy, setBusy] = React.useState(false);

  return (
    <div
      className={cn(
        "group rounded-2xl border p-3 transition",
        item.read ? "border-slate-100 bg-white" : "border-slate-200 bg-slate-50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={async () => {
            if (item.read) return;
            setBusy(true);
            try {
              await onMarkRead(item.id);
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          <div className="flex min-w-0 items-center gap-2">
            {!item.read ? (
              <span className="h-2 w-2 flex-none rounded-full bg-slate-900" />
            ) : null}
            <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
              {item.title}
            </p>
          </div>

          {item.message ? (
            <p className="mt-1 line-clamp-2 break-words text-sm text-slate-600">
              {item.message}
            </p>
          ) : null}

          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {typeLabel(item.type)} • {timeAgo(item.createdAt)}
            </p>
            {!item.read ? (
              <span className="text-xs font-medium text-slate-900">Mark read</span>
            ) : null}
          </div>
        </button>

        <button
          type="button"
          className={cn(
            "flex-none grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition",
            busy && "pointer-events-none opacity-60"
          )}
          aria-label="Remove notification"
          onClick={async () => {
            setBusy(true);
            try {
              await onRemove(item.id);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
