
import React from "react";
import { DataTable, Badge, type Column } from "../../../app/shared";
import type { TopCourse } from "../Types/dashboard.types";

function toneForCompletion(rate: number) {
  if (rate >= 75) return "success";
  if (rate >= 60) return "info";
  if (rate >= 45) return "warning";
  return "danger";
}

function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
}

type Props = {
  rows: TopCourse[];
  isLoading?: boolean;
};

const TopCoursesTable: React.FC<Props> = ({ rows, isLoading }) => {
  const columns: Column<TopCourse>[] = [
    {
      key: "course",
      header: "Course",
      cell: (r) => (
        <div>
          <p className="font-medium text-slate-900">{r.title}</p>
          {r.gradeLabel ? <p className="text-xs text-slate-500">{r.gradeLabel}</p> : null}
        </div>
      ),
    },
    { key: "enrolled", header: "Enrolled", cell: (r) => formatCompact(r.enrolled) },
    {
      key: "completion",
      header: "Completion",
      cell: (r) => <Badge tone={toneForCompletion(r.completionRate)}>{r.completionRate}%</Badge>,
    },
    { key: "watch", header: "Watch Minutes", cell: (r) => formatCompact(r.watchMinutes) },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      isLoading={isLoading}
      emptyTitle="No courses yet"
      emptyDescription="Top courses will appear here when students start learning."
    />
  );
};

export default TopCoursesTable;
