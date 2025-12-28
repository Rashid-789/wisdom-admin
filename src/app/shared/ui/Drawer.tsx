import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClassName?: string; // e.g. "w-[520px]"
};

function useLockBodyScroll(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [enabled]);
}

const Drawer: React.FC<Props> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  widthClassName = "w-full max-w-[520px] sm:w-[520px]",
}) => {
  useLockBodyScroll(open);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="absolute inset-0 flex justify-end">
        <div
          className={cn(
            "flex h-dvh flex-col bg-white shadow-2xl", // ✅ dvh for mobile browser UI
            "max-w-[100vw]", // ✅ never overflow viewport
            widthClassName
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
            <div className="min-w-0">
              {title ? <h2 className="truncate text-base font-semibold text-slate-900">{title}</h2> : null}
              {description ? <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p> : null}
            </div>
            <button
              className="flex-none rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
              onClick={onClose}
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

          {footer ? <div className="border-t border-slate-100 px-4 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
