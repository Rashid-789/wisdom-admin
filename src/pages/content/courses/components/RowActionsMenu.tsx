import React from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { cn } from "../../../../app/utils/cn";

type Props = {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
  loadingLabel?: string;
  disabled?: boolean;
};

export default function RowActionsMenu({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
  loadingLabel = "Working...",
  disabled = false,
}: Props) {
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menuRef.current?.getBoundingClientRect();

    const menuWidth = menuRect?.width ?? 144;
    const menuHeight = menuRect?.height ?? 96;
    const sideOffset = 8;
    const viewportPadding = 8;

    let top = triggerRect.bottom + sideOffset;
    if (top + menuHeight + viewportPadding > window.innerHeight) {
      top = triggerRect.top - sideOffset - menuHeight;
    }
    if (top < viewportPadding) top = viewportPadding;

    let left = triggerRect.right - menuWidth;
    if (left + menuWidth + viewportPadding > window.innerWidth) {
      left = window.innerWidth - menuWidth - viewportPadding;
    }
    if (left < viewportPadding) left = viewportPadding;

    setPosition({ top, left });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const raf = window.requestAnimationFrame(updatePosition);
    return () => window.cancelAnimationFrame(raf);
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onViewportChange = () => updatePosition();

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEscape);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [open, updatePosition]);

  const closeMenu = React.useCallback(() => setOpen(false), []);

  const menu = open ? (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[9999] w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
      style={{ top: position.top, left: position.left }}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (disabled) return;
          closeMenu();
          onEdit();
        }}
        disabled={disabled}
      >
        {disabled ? loadingLabel : editLabel}
      </button>

      <button
        type="button"
        className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (disabled) return;
          closeMenu();
          onDelete();
        }}
        disabled={disabled}
      >
        {disabled ? loadingLabel : deleteLabel}
      </button>
    </div>
  ) : null;

  return (
    <div
      className={cn("relative", disabled && "pointer-events-none opacity-60")}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        className="rounded-lg p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
        aria-label="Row actions"
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
      >
        <MoreVertical size={18} />
      </button>

      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  );
}
