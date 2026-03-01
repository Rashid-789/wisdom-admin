import { Button, DataTable } from "../../../../app/shared";
import type { BookSubject } from "../../Types/books.types";

function StatusPill({ v }: { v: BookSubject["status"] }) {
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

export default function SubjectsTable({
  rows,
  isLoading,
  onRowClick,
  onEdit,
}: {
  rows: BookSubject[];
  isLoading?: boolean;
  onRowClick: (s: BookSubject) => void;
  onEdit: (s: BookSubject) => void;
}) {
  return (
    <DataTable
      isLoading={isLoading}
      rows={rows}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      columns={[
        {
          key: "subject",
          header: "Subject",
          cell: (s) => (
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {s.thumbnailUrl ? <img src={s.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{s.title}</p>
                <p className="truncate text-xs text-slate-500">{s.gradeLabel ?? "No grade label"}</p>
              </div>
            </div>
          ),
        },
        { key: "status", header: "Status", cell: (s) => <StatusPill v={s.status} /> },
        {
          key: "actions",
          header: "",
          cell: (s) => (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(s);
                }}
              >
                Edit
              </Button>
            </div>
          ),
        },
      ]}
      emptyTitle="No subjects found"
      emptyDescription="Create a subject, then upload PDF books inside it."
    />
  );
}
