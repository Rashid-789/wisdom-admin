/* eslint-disable no-useless-escape */
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button, Card, CardContent, DataTable, Input, Pagination } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";
import { deleteCourse, getSkillSubject, listCourses } from "../Api/content.api";
import type { Course, SkillSubject, SubjectOption } from "../Types/content.types";
import CourseFormDrawer from "../courses/components/CourseFormDrawer";
import StatusBadge from "../courses/components/StatusBadge";

export default function SkillSubjectDetailsPage() {
  const nav = useNavigate();
  const { subjectId = "" } = useParams();

  const [subject, setSubject] = React.useState<SkillSubject | null>(null);

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Course[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Course | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!subjectId) return;
    void (async () => {
      const fetched = await getSkillSubject(subjectId);
      setSubject(fetched);
    })();
  }, [subjectId]);

  const subjectOptions: SubjectOption[] = React.useMemo(() => {
    return [{ id: subjectId, title: subject?.title ?? "Skill Subject", category: "skill" }];
  }, [subjectId, subject]);

  const load = React.useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const res = await listCourses({
        page,
        pageSize,
        search,
        subjectId,
        category: "skill",
        status: "all",
      });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, subjectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="mb-4 space-y-3">
        <Button
          variant="outline"
          onClick={() => nav(paths.admin.content.skillSubjects)}
          className="w-fit"
        >
          {"<- Back to Skill Subjects"}
        </Button>
        <p className="text-xs text-slate-500">Content / Skill Subjects / {subject?.title ?? "Loading..."}</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Skill Subject</p>
              <h2 className="truncate text-lg font-semibold text-slate-900">
                {subject?.title ?? "Loading..."}
              </h2>
              <p className="text-sm text-slate-500">{subject?.lecturerName ?? ""}</p>
              <p className="mt-1 text-xs text-slate-500">{"Courses -> Chapters -> Topics"}</p>
            </div>

            <Button
              onClick={() => {
                setEditing(null);
                setDrawerOpen(true);
              }}
            >
              Add Course
            </Button>
          </div>

          <Input
            label="Search Courses"
            placeholder="e.g. Public Speaking Basics"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

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
                key: "status",
                header: "Status",
                cell: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: "createdAt",
                header: "Created",
                cell: (row) => new Date(row.createdAt).toLocaleDateString(),
              },
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
                          await deleteCourse("skill", row.subjectId ?? row.id, row.id);
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
            emptyTitle="No courses in this skill subject"
            emptyDescription="Create a course and start building curriculum."
          />

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>

      <CourseFormDrawer
        open={drawerOpen}
        course={editing}
        subjects={subjectOptions}
        defaultSubjectId={subjectId}
        lockSubject
        defaultCategory="skill"
        lockCategory
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          await load();
          setDrawerOpen(false);
          setEditing(null);
        }}
      />
    </>
  );
}
