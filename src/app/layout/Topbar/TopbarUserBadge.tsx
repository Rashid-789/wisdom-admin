import React from "react";
import type { AdminUser } from "../../auth/useAdminSession";
import { cn } from "../../utils/cn";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "A";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

type Props = {
  user: AdminUser;
  className?: string;
};

const TopbarUserBadge: React.FC<Props> = ({ user, className }) => {
  return (
    <div
      className={cn(
        "flex flex-none items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2",
        // ✅ prevents long names from breaking topbar on medium screens
        "max-w-[220px] sm:max-w-[280px]",
        className
      )}
    >
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#13334c] text-sm font-semibold text-white">
        {initials(user.name)}
      </div>

      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
      </div>
    </div>
  );
};

export default TopbarUserBadge;
