import React from "react";
import { cn } from "../../utils/cn";

type Option = { label: string; value: string };

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
  error?: string;
};

const Select = React.forwardRef<HTMLSelectElement, Props>(
  ({ className, label, options, error, ...props }, ref) => {
    return (
      <label className="block">
        {label ? <span className="mb-1 block text-sm font-medium text-slate-900">{label}</span> : null}

        <select
          ref={ref}
          className={cn(
            "h-10 w-full rounded-2xl border bg-white px-3 text-sm outline-none transition",
            error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-slate-400",
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
      </label>
    );
  }
);

Select.displayName = "Select";
export default Select;
