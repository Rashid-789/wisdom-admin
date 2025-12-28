import { Bell } from "lucide-react";
import { cn } from ".././app/utils/cn";

type Props = {
  unreadCount: number;
  open: boolean;
  onToggle: () => void;
};

export default function NotificationBell({ unreadCount, open, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative grid place-items-center rounded-2xl border transition flex-none",
        // Responsive tap target (slightly smaller on very small screens, same look on sm+)
        "h-9 w-9 sm:h-10 sm:w-10",
        open
          ? "border-slate-300 bg-slate-50 text-slate-900"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
      aria-label="Notifications"
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      <Bell size={18} />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-slate-900 px-1 text-[11px] font-semibold leading-none text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
}
