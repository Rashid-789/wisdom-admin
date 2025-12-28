
// import React from "react";
import { cn } from "../../../../app/utils/cn";
import type { PublishStatus } from "../../Types/content.types";

export default function StatusBadge({ status }: { status: PublishStatus }) {
  const cls =
    status === "published"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status === "scheduled"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-slate-50 text-slate-700 border-slate-100";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", cls)}>
      {status}
    </span>
  );
}
