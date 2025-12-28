import { DataTable, Button } from "../../../../app/shared";
import type { LiveSession } from "../../Types/liveClasses.types";
import { formatTimeRange } from "../../utils/liveClasses.utils";

function StatusPill({ v }: { v: LiveSession["status"] }) {
  const cls =
    v === "live"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : v === "scheduled"
      ? "bg-slate-50 text-slate-700 border-slate-100"
      : v === "ended"
      ? "bg-indigo-50 text-indigo-700 border-indigo-100"
      : "bg-rose-50 text-rose-700 border-rose-100";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>{v}</span>;
}

type Props = {
  rows: LiveSession[];
  isLoading?: boolean;
  onRowClick: (row: LiveSession) => void;
  onEdit: (row: LiveSession) => void;
};

export default function LiveClassTable({ rows, isLoading, onRowClick, onEdit }: Props) {
  return (
    <DataTable
      isLoading={isLoading}
      rows={rows}
      rowKey={(r) => r.id}
      columns={[
        {
          key: "title",
          header: "Session",
          cell: (r) => (
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{r.title}</p>
              <p className="truncate text-xs text-slate-500">
                {r.courseTitle ?? "No course"} {r.topicTitle ? `• ${r.topicTitle}` : ""}
              </p>
            </div>
          ),
        },
        { key: "teacher", header: "Host", cell: (r) => r.hostTeacherName ?? "-" },
        { key: "time", header: "Time", cell: (r) => <span className="text-sm text-slate-700">{formatTimeRange(r.startAt, r.endAt)}</span> },
        { key: "cap", header: "Capacity", cell: (r) => String(r.capacity) },
        { key: "status", header: "Status", cell: (r) => <StatusPill v={r.status} /> },
        {
          key: "actions",
          header: "",
          cell: (r) => (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(r);
                }}
              >
                Edit
              </Button>
            </div>
          ),
        },
      ]}
      onRowClick={onRowClick}
      emptyTitle="No sessions found"
      emptyDescription="Create a live session to start scheduling classes."
    />
  );
}
