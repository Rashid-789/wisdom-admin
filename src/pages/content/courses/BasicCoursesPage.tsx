import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, DataTable, Input, Pagination } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";
import { deleteCourseCascade, listCoursesByBucket } from "../Api/content.api";
import type { Course } from "../Types/content.types";
import { useAsyncLock } from "../hooks/useAsyncLock";
import { getApiErrorMessage } from "../utils/curriculum.utils";
import CourseFormDrawer from "./components/CourseFormDrawer";
import RowActionsMenu from "./components/RowActionsMenu";
import StatusBadge from "./components/StatusBadge";

export default function BasicCoursesPage() {
  const nav = useNavigate();

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Course[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Course | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const { busy: savingCourse, run: runSaveCourse } = useAsyncLock();
  const loadSeqRef = React.useRef(0);

  const load = React.useCallback(async () => {
    const seq = ++loadSeqRef.current;
    setLoading(true);

    try {
      const res = await listCoursesByBucket("basicCourse", { page, pageSize, search, status: "all" });
      if (seq !== loadSeqRef.current) return;
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      if (seq === loadSeqRef.current) {
        setLoading(false);
      }
    }
  }, [page, pageSize, search]);

  React.useEffect(() => {
    void load().catch((error) => {
      toast.error(getApiErrorMessage(error, "Failed to load basic courses"));
    });
  }, [load]);

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Input
              label="Search Basic Courses"
              placeholder="e.g. Algebra I"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              disabled={savingCourse || deletingId !== null}
            />
            <Button
              isLoading={savingCourse}
              disabled={savingCourse || deletingId !== null}
              onClick={() => {
                setEditing(null);
                setDrawerOpen(true);
              }}
            >
              Add Basic Course
            </Button>
          </div>

          <DataTable
            isLoading={loading}
            rows={rows}
            rowKey={(row) => row.id}
            columns={[
              {
                key: "thumbnail",
                header: "Thumbnail",
                cell: (row) =>
                  row.coverImage ? (
                    <img src={row.coverImage} alt={row.title} className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-slate-100" />
                  ),
              },
              { key: "title", header: "Title", accessor: "title" },
              { key: "gradeRange", header: "Grade", cell: (row) => row.gradeRange ?? "-" },
              { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
              { key: "createdAt", header: "Created", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
              {
                key: "actions",
                header: "",
                cell: (row) => (
                  <div className="flex justify-end">
                    <RowActionsMenu
                      disabled={savingCourse || deletingId === row.id}
                      loadingLabel="Deleting..."
                      onEdit={() => {
                        if (deletingId === row.id) return;
                        setEditing(row);
                        setDrawerOpen(true);
                      }}
                      onDelete={async () => {
                        if (deletingId || savingCourse) return;
                        if (!window.confirm(`Delete course "${row.title}"?`)) return;

                        setDeletingId(row.id);
                        try {
                          await deleteCourseCascade("basicCourse", row.id);
                          await load();
                          toast.success("Course deleted");
                        } catch (error) {
                          toast.error(getApiErrorMessage(error, "Failed to delete course"));
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    />
                  </div>
                ),
              },
            ]}
            onRowClick={(row) => {
              if (deletingId === row.id) return;
              nav(paths.admin.content.courseDetail(row.id));
            }}
            emptyTitle="No basic courses found"
            emptyDescription="Create a basic course to build chapters and topics."
          />

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>

      <CourseFormDrawer
        open={drawerOpen}
        course={editing}
        lockCategory
        defaultCategory="basic"
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        onSaved={async () => {
          await runSaveCourse(async () => {
            await load();
            setEditing(null);
            return true;
          });
        }}
      />
    </>
  );
}
