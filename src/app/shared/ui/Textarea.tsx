/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import { cn } from "../../utils/cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, id, rows = 4, ...props },
  ref
) {
  const inputId = id ?? React.useId();

  return (
    <label className="flex flex-col gap-1 text-sm text-slate-700" htmlFor={inputId}>
      {label && <span className="font-medium text-slate-900">{label}</span>}
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition",
          error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-slate-400",
          className
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
});

export type { TextareaProps };
export default Textarea;
