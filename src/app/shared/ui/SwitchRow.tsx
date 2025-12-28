import React from "react";
import { cn } from "../../utils/cn";

type Props = {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  id?: string;
};

export default function SwitchRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
  id,
}: Props) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const switchId = id ?? React.useId();

  const toggle = React.useCallback(() => {
    if (disabled) return;
    onChange(!checked);
  }, [checked, disabled, onChange]);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    },
    [disabled, toggle]
  );

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3",
        disabled && "opacity-60"
      )}
    >
      <div className="min-w-0">
        <label htmlFor={switchId} className="block text-sm font-medium text-slate-900">
          {title}
        </label>
        {description ? <p className="break-words text-xs text-slate-500">{description}</p> : null}
      </div>

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={cn(
          "relative flex-none h-6 w-11 rounded-full border transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
          checked ? "border-slate-900 bg-[#13334c]" : "border-slate-200 bg-slate-100",
          disabled && "cursor-not-allowed",
          "overflow-hidden"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm",
            "transition-all duration-200 will-change-transform",
            checked ? "left-[calc(100%-1.25rem-2px)]" : "left-[2px]"
          )}
        />
      </button>
    </div>
  );
}
