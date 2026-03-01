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
  return (
    <details
      className={cn("relative", disabled && "pointer-events-none opacity-60")}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <summary
        className="list-none rounded-lg p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 [&::-webkit-details-marker]:hidden"
        aria-label="Row actions"
      >
        <MoreVertical size={18} />
      </summary>

      <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (disabled) return;
            onEdit();
          }}
          disabled={disabled}
        >
          {disabled ? loadingLabel : editLabel}
        </button>

        <button
          type="button"
          className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (disabled) return;
            onDelete();
          }}
          disabled={disabled}
        >
          {disabled ? loadingLabel : deleteLabel}
        </button>
      </div>
    </details>
  );
}
