import { DataTable, Button } from "../../../../app/shared";
import type { Book } from "../../Types/books.types";
import { formatMoney } from "../../utils/books.utils";

function StatusPill({ v }: { v: Book["status"] }) {
  const cls =
    v === "published"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : "border-slate-100 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {v}
    </span>
  );
}

type Props = {
  rows: Book[];
  isLoading?: boolean;
  onRowClick: (b: Book) => void;
  onEdit: (b: Book) => void;
};

export default function BooksTable({ rows, isLoading, onRowClick, onEdit }: Props) {
  return (
    <DataTable
      isLoading={isLoading}
      rows={rows}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      columns={[
        {
          key: "book",
          header: "Book",
          cell: (b) => (
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                {b.coverUrl ? (
                  <img src={b.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{b.title}</p>
                <p className="truncate text-xs text-slate-500">
                  {b.subjectTitle ?? "No subject"} {b.courseTitle ? `• ${b.courseTitle}` : ""}
                </p>
              </div>
            </div>
          ),
        },
        { key: "price", header: "Price", cell: (b) => formatMoney(b.price, b.currency) },
        { key: "type", header: "Type", cell: (b) => b.fileType.toUpperCase() },
        { key: "status", header: "Status", cell: (b) => <StatusPill v={b.status} /> },
        {
          key: "actions",
          header: "",
          cell: (b) => (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(b);
                }}
              >
                Edit
              </Button>
            </div>
          ),
        },
      ]}
      emptyTitle="No books found"
      emptyDescription="Upload a book PDF/EPUB and publish it when ready."
    />
  );
}

