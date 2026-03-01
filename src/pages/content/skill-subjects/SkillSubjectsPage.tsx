import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, DataTable, Input, Pagination } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";
import { listSkillSubjects } from "../Api/content.api";
import type { SkillSubject } from "../Types/content.types";
import SkillSubjectFormDrawer from "./components/SkillSubjectFormDrawer";

export default function SkillSubjectsPage() {
  const nav = useNavigate();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<SkillSubject[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await listSkillSubjects({ page, pageSize, search });
      setRows(result.rows);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Input
              label="Search Skill Subjects"
              placeholder="e.g. Public Speaking"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Button onClick={() => setDrawerOpen(true)}>Add Skill Subject</Button>
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
              { key: "title", header: "Title", accessor: "title" },
              {
                key: "lecturerName",
                header: "Lecturer",
                cell: (row) => row.lecturerName ?? "-",
              },
              {
                key: "createdAt",
                header: "Created",
                cell: (row) => new Date(row.createdAt).toLocaleDateString(),
              },
            ]}
            onRowClick={(row) => nav(paths.admin.content.skillSubjectDetail(row.id))}
            emptyTitle="No skill subjects found"
            emptyDescription="Add a skill subject to start creating courses and curriculum."
          />

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>

      <SkillSubjectFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          setDrawerOpen(false);
          await load();
        }}
      />
    </>
  );
}
