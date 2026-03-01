import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, CardContent, DataTable, Input, Pagination, Button, Select } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";
import { deleteCourse, listBasicSubjects, listCourses, listSkillSubjects } from "../Api/content.api";
import type { Course, CourseCategory, PublishStatus, SubjectOption } from "../Types/content.types";
import CourseFormDrawer from "./components/CourseFormDrawer";
import StatusBadge from "./components/StatusBadge";

function categoryBadge(category: CourseCategory) {
  return (
    <span
      className={
        category === "skill"
          ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
          : "rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
      }
    >
      {category.toUpperCase()}
    </span>
  );
}

export default function CoursesPage() {
  const nav = useNavigate();

  const [subjectFilter, setSubjectFilter] = React.useState<string>("all");
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
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const [basicSubjects, setBasicSubjects] = React.useState<SubjectOption[]>([]);
  const [skillSubjects, setSkillSubjects] = React.useState<SubjectOption[]>([]);

  const allSubjects = React.useMemo(() => {
    return [...basicSubjects, ...skillSubjects];
  }, [basicSubjects, skillSubjects]);

  const subjectLabelMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const subject of allSubjects) {
      const key = `${subject.category ?? "basic"}:${subject.id}`;
      map.set(key, subject.title);
    }
    return map;
  }, [allSubjects]);

  const selectedSubject = React.useMemo(() => {
    if (subjectFilter === "all") return null;
    const [parsedCategory, parsedId] = subjectFilter.split(":");
    if ((parsedCategory !== "basic" && parsedCategory !== "skill") || !parsedId) return null;
    return {
      id: parsedId,
      category: parsedCategory as CourseCategory,
    };
  }, [subjectFilter]);

  const loadSubjects = React.useCallback(async () => {
    const [basicRes, skillRes] = await Promise.all([
      listBasicSubjects({ page: 1, pageSize: 200 }),
      listSkillSubjects({ page: 1, pageSize: 200 }),
    ]);

    setBasicSubjects(basicRes.rows.map((subject) => ({ id: subject.id, title: subject.title, category: "basic" })));
    setSkillSubjects(skillRes.rows.map((subject) => ({ id: subject.id, title: subject.title, category: "skill" })));
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const effectiveCategory: CourseCategory | "all" = selectedSubject ? selectedSubject.category : category;
      const res = await listCourses({
        page,
        pageSize,
        search,
        subjectId: selectedSubject?.id,
        status,
        category: effectiveCategory,
      });

      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, selectedSubject, status, category]);

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
          <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px_220px_220px_auto] lg:items-end">
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
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All", value: "all" },
                ...allSubjects.map((subject) => ({
                  label: `${subject.category === "skill" ? "[Skill]" : "[Basic]"} ${subject.title}`,
                  value: `${subject.category ?? "basic"}:${subject.id}`,
                })),
              ]}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as CourseCategory | "all");
                setPage(1);
              }}
              disabled={Boolean(selectedSubject)}
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
                key: "coverImage",
                header: "Thumbnail",
                cell: (row) =>
                  row.coverImage ? (
                    <img
                      src={row.coverImage}
                      alt={row.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-[10px] uppercase text-slate-500">
                      None
                    </div>
                  ),
              },
              {
                key: "title",
                header: "Course",
                cell: (row) => <p className="font-medium text-slate-900">{row.title}</p>,
              },
              {
                key: "subjectTitle",
                header: "Subject",
                cell: (row) => {
                  const key = `${row.category}:${row.subjectId}`;
                  return subjectLabelMap.get(key) ?? row.subjectTitle ?? row.subjectId;
                },
              },
              {
                key: "category",
                header: "Category",
                cell: (row) => categoryBadge(row.category),
              },
              { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
              { key: "createdAt", header: "Created", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
              {
                key: "actions",
                header: "",
                cell: (row) => (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditing(row);
                        setDrawerOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      disabled={deletingId === row.id}
                      onClick={async (event) => {
                        event.stopPropagation();
                        if (!window.confirm(`Delete course \"${row.title}\"? This removes all chapters and topics.`)) {
                          return;
                        }

                        setDeletingId(row.id);
                        try {
                          await deleteCourse(row.category, row.subjectId ?? row.id, row.id);
                          toast.success("Course deleted");
                          await load();
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Failed to delete course");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
            onRowClick={(row) => nav(paths.admin.content.courseDetail(row.id))}
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
        subjects={allSubjects}
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          setDrawerOpen(false);
          await load();
        }}
      />
    </>
  );
}
