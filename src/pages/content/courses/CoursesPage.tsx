import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, DataTable, Input, Pagination, Button, Select } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";
import { listCourses, listSubjects } from "../Api/content.api";
import type { Course, Subject, PublishStatus, CourseCategory } from "../Types/content.types";
import CourseFormDrawer from "./components/CourseFormDrawer";
import StatusBadge from "./components/StatusBadge";

export default function CoursesPage() {
  const nav = useNavigate();

  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [subjectId, setSubjectId] = React.useState<string>("all");
  const [status, setStatus] = React.useState<PublishStatus | "all">("all");
  const [category, setCategory] = React.useState<CourseCategory | "all">("all");
  const [search, setSearch] = React.useState("");

  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Course[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Course | null>(null);

  const subjectById = React.useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject.title]));
  }, [subjects]);

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
        category,
      });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, subjectId, status, category]);

  React.useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px_220px_auto] lg:items-end">
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
                ...subjects.map((subject) => ({ label: subject.title, value: subject.id })),
              ]}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as CourseCategory | "all");
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
                setStatus(e.target.value as PublishStatus | "all");
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
            rowKey={(row) => row.id}
            columns={[
              {
                key: "title",
                header: "Course",
                cell: (row) => (
                  <div>
                    <p className="font-medium text-slate-900">{row.title}</p>
                    <p className="text-xs text-slate-500">
                      {row.category.toUpperCase()} - {subjectById.get(row.subjectId) ?? row.subjectId}
                    </p>
                  </div>
                ),
              },
              { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
              { key: "created", header: "Created", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
            ]}
            onRowClick={(row) => nav(paths.admin.content.basicSubjectDetail(row.subjectId))}
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
