import React from "react";
import { cn } from "../../utils/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, Props>(({ className, label, hint, error, ...props }, ref) => {
  return (
    <label className="block">
      {label ? <span className="mb-1 block text-sm font-medium text-slate-900">{label}</span> : null}

      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-2xl border bg-white px-3 text-sm outline-none transition",
          error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-slate-400",
          className
        )}
        {...props}
      />

      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
});

Input.displayName = "Input";
export default Input;

