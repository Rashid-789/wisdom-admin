import React from "react";
import type { AdminUser } from "../../../pages/auth/Types/auth.types";
import { cn } from "../../utils/cn";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "A";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

type Props = {
  user: AdminUser & { avatarUrl?: string | null; displayName?: string };
  className?: string;
};

const TopbarUserBadge: React.FC<Props> = ({ user, className }) => {
  const label = (user.displayName ?? user.name ?? "Admin").trim();
  const avatar = user.avatarUrl ?? null;

  return (
    <div
      className={cn(
        "flex flex-none items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2",
        "max-w-[220px] sm:max-w-[280px]",
        className
      )}
    >
      <div className="relative h-9 w-9 flex-none overflow-hidden rounded-full border border-white/20 bg-[#13334c]">
        {avatar ? (
          <img
            src={avatar}
            alt={label}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => {
              // fallback to initials if image fails
              (e.currentTarget as HTMLImageElement).src = "";
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm font-semibold text-white">
            {initials(label)}
          </div>
        )}
      </div>

      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-medium text-slate-900">{label}</p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
      </div>
    </div>
  );
};

export default TopbarUserBadge;
