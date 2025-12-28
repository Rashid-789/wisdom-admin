
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, DataTable, Input, Pagination, Button, Select } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";
import { listCourses, listSubjects } from "../Api/content.api";
import type { Course, Subject, PublishStatus } from "../Types/content.types";
import CourseFormDrawer from "./components/CourseFormDrawer";
import StatusBadge from "./components/StatusBadge";
import { SectionTabs } from "../../../app/shared";
import { contentTabs } from "../../../app/shared/tabs";


export default function CoursesPage() {
  const nav = useNavigate();

  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [subjectId, setSubjectId] = React.useState<string>("all");
  const [status, setStatus] = React.useState<PublishStatus | "all">("all");
  const [search, setSearch] = React.useState("");

  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Course[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Course | null>(null);

  const loadSubjects = React.useCallback(async () => {
    const res = await listSubjects({ page: 1, pageSize: 100 });
    setSubjects(res.rows);
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCourses({
        page,
        pageSize,
        search,
        subjectId: subjectId === "all" ? undefined : subjectId,
        status,
      });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, subjectId, status]);

  React.useEffect(() => { loadSubjects(); }, [loadSubjects]);
  React.useEffect(() => { load(); }, [load]);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
                  <SectionTabs tabs={contentTabs} />
                </div>
          <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
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
              label="Subject"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All", value: "all" },
                ...subjects.map((s) => ({ label: s.title, value: s.id })),
              ]}
            />

            <Select
              label="Status"
              value={status}
              onChange={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditing(null);
                  setDrawerOpen(true);
                }}
              >
                Add Course
              </Button>
            </div>
          </div>

          <DataTable
            isLoading={loading}
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              { key: "title", header: "Course", cell: (r) => <div><p className="font-medium text-slate-900">{r.title}</p><p className="text-xs text-slate-500">{r.category.toUpperCase()} • {r.subjectId}</p></div> },
              { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              { key: "created", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
            ]}
            onRowClick={(r) => nav(paths.admin.content.courseDetail(r.id))}
            emptyTitle="No courses found"
            emptyDescription="Create a course and start building curriculum."
          />

          <div className="mt-4">
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </div>
        </CardContent>
      </Card>

      <CourseFormDrawer
        open={drawerOpen}
        course={editing}
        subjects={subjects}
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          setDrawerOpen(false);
          await load();
        }}
      />
    </>
  );
}
