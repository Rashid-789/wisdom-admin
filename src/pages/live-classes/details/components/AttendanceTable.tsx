import { Card, CardContent, DataTable } from "../../../../app/shared";
import type { AttendanceRow } from "../../Types/liveClasses.types";

export default function AttendanceTable({ rows }: { rows: AttendanceRow[] }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Attendance</p>
          <p className="text-sm text-slate-500">Students who joined this session</p>
        </div>

        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            { key: "name", header: "Student", cell: (r) => <div><p className="font-medium text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.email ?? "-"}</p></div> },
            { key: "joined", header: "Joined", cell: (r) => (r.joinedAt ? new Date(r.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-") },
            { key: "left", header: "Left", cell: (r) => (r.leftAt ? new Date(r.leftAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-") },
          ]}
          emptyTitle="No attendance yet"
          emptyDescription="Attendance will appear when students join the session."
        />
      </CardContent>
    </Card>
  );
}
