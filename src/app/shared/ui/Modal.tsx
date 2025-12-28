
import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

type Size = "sm" | "md" | "lg";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: Size;
  hideClose?: boolean;
};

const sizeClasses: Record<Size, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
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

const Modal: React.FC<Props> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideClose,
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
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={cn("w-full rounded-2xl bg-white shadow-xl", sizeClasses[size])}>
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
            <div>
              {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
              {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
            </div>
            {!hideClose ? (
              <button
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>

          <div className="px-4 py-4 sm:px-6">{children}</div>

          {footer ? (
            <div className="border-t border-slate-100 px-4 py-4 sm:px-6">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
