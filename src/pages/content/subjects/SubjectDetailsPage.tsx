/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, DataTable, Input, Pagination, Button, Select } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";
import type { Course, PublishStatus, Subject, CourseCategory } from "../Types/content.types";
import { getSubject, listCourses } from "../Api/content.api";
import CourseFormDrawer from "../courses/components/CourseFormDrawer";
import StatusBadge from "../courses/components/StatusBadge";

export default function SubjectDetailsPage() {
  const nav = useNavigate();
  const { subjectId = "" } = useParams();

  const [subject, setSubject] = React.useState<Subject | null>(null);

  const [category, setCategory] = React.useState<CourseCategory | "all">("all");
  const [status, setStatus] = React.useState<PublishStatus | "all">("all");
  const [search, setSearch] = React.useState("");

  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Course[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setSubject(await getSubject(subjectId));
    })();
  }, [subjectId]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCourses({
        page,
        pageSize,
        search,
        subjectId,
        status,
        category,
      });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, subjectId, status, category]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Subject</p>
              <h2 className="truncate text-lg font-semibold text-slate-900">
                {subject?.title ?? "Loading..."}
              </h2>
              <p className="text-sm text-slate-500">{subject?.gradeRange ?? ""}</p>
            </div>
            <Button onClick={() => setDrawerOpen(true)}>Add Course</Button>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px] lg:items-end">
            <Input
              label="Search Courses"
              placeholder="e.g. Trigonometry"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as any);
                setPage(1);
              }}
              options={[
                { label: "All", value: "all" },
                { label: "Basic", value: "basic" },
                { label: "Skill", value: "skill" },
              ]}
            />

            <Select
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
              options={[
                { label: "All", value: "all" },
                { label: "Draft", value: "draft" },
                { label: "Published", value: "published" },
                { label: "Scheduled", value: "scheduled" },
              ]}
            />
          </div>

          <DataTable
            isLoading={loading}
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              {
                key: "course",
                header: "Course",
                cell: (r) => (
                  <div>
                    <p className="font-medium text-slate-900">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.category.toUpperCase()}</p>
                  </div>
                ),
              },
              { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              { key: "createdAt", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
            ]}
            onRowClick={(r) => nav(paths.admin.content.courseDetail(r.id))}
            emptyTitle="No courses in this subject"
            emptyDescription="Add a course and then build curriculum (for Basic) or lectures (for Skill)."
          />

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>

      {/* Add course inside this subject (subject locked) */}
      <CourseFormDrawer
        open={drawerOpen}
        course={null}
        subjects={subject ? [subject] : []}
        defaultSubjectId={subjectId}
        lockSubject
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          setDrawerOpen(false);
          await load();
        }}
      />
    </>
  );
}