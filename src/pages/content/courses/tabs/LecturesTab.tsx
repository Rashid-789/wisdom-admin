import React from "react";
import { Card, CardContent, Button, Input, DataTable, Pagination } from "../../../../app/shared";
import type { Course, Lecture } from "../../Types/content.types";
import { listLectures } from "../../Api/content.api";
import LectureUploadCard from "../components/lectures/LectureUploadCard";
import LectureEditorDrawer from "../components/lectures/LectureEditorDrawer";

export default function LecturesTab({ course }: { course: Course }) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  const [rows, setRows] = React.useState<Lecture[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [editLectureId, setEditLectureId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listLectures({ page, pageSize, search, courseId: course.id });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, course.id]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <Input
                label="Search Lectures"
                placeholder="e.g. Introduction"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <Button variant="outline" onClick={load}>Refresh</Button>
            </div>

            <DataTable
              isLoading={loading}
              rows={rows}
              rowKey={(r) => r.id}
              columns={[
                { key: "title", header: "Lecture", accessor: "title" },
                { key: "createdAt", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
              ]}
              onRowClick={(r) => setEditLectureId(r.id)}
              emptyTitle="No lectures yet"
              emptyDescription="Create lecture videos for Skill course (direct video list)."
            />

            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </CardContent>
        </Card>

        <LectureUploadCard courseId={course.id} onUploaded={load} />
      </div>

      <LectureEditorDrawer
        open={!!editLectureId}
        lectureId={editLectureId}
        onClose={() => setEditLectureId(null)}
        onSaved={load}
      />
    </>
  );
}