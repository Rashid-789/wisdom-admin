// import React from "react";
import { Card, CardContent } from "../../../../app/shared";
import type { Course } from "../../Types/content.types";
import StatusBadge from "./StatusBadge";

export default function CourseHeader({ course }: { course: Course }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-900">{course.title}</h2>
          <p className="text-sm text-slate-500">{course.description || "No description yet."}</p>
          <p className="mt-1 text-xs text-slate-500">Category: {course.category.toUpperCase()}</p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={course.status} />
        </div>
      </CardContent>
    </Card>
  );
}
