
import React from "react";
import { cn } from "../../utils/cn";

type Tone = "default" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

type Props = React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone };

const Badge: React.FC<Props> = ({ className, tone = "default", ...props }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
};

export default Badge;
