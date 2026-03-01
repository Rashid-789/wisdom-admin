import { DataTable, Button } from "../../../../app/shared";
import type { SubBook } from "../../Types/books.types";
import { formatSubBookPrice } from "../../utils/books.utils";

function StatusPill({ v }: { v: SubBook["status"] }) {
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

export default function SubBooksTable({
  rows,
  isLoading,
  onEdit,
}: {
  rows: SubBook[];
  isLoading?: boolean;
  onEdit: (b: SubBook) => void;
}) {
  return (
    <DataTable
      isLoading={isLoading}
      rows={rows}
      rowKey={(r) => r.id}
      columns={[
        {
          key: "book",
          header: "Book (PDF)",
          cell: (b) => (
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                {b.coverUrl ? <img src={b.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{b.title}</p>
                <p className="truncate text-xs text-slate-500">
                  {b.author ?? "Author/Publisher"}{b.publisher ? ` • ${b.publisher}` : ""}
                </p>
              </div>
            </div>
          ),
        },
        { key: "price", header: "Price", cell: (b) => formatSubBookPrice(b) },
        { key: "status", header: "Status", cell: (b) => <StatusPill v={b.status} /> },
        {
          key: "actions",
          header: "",
          cell: (b) => (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (b.pdfUrl) window.open(b.pdfUrl, "_blank");
                }}
                disabled={!b.pdfUrl}
              >
                View PDF
              </Button>
              <Button variant="outline" onClick={() => onEdit(b)}>
                Edit
              </Button>
            </div>
          ),
        },
      ]}
      emptyTitle="No books uploaded"
      emptyDescription="Upload a PDF book with cover and pricing (tokens / Rs)."
    />
  );
}