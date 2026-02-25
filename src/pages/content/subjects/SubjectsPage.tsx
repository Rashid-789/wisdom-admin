import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, DataTable, Input, Pagination, Button } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";
import type { Subject } from "../Types/content.types";
import { listSubjects } from "../Api/content.api";
import SubjectFormDrawer from "./components/SubjectFormDrawer";

export default function SubjectsPage() {
  const nav = useNavigate();

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Subject[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Subject | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listSubjects({ page, pageSize, search });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Input
              label="Search Basic Subjects"
              placeholder="e.g. Mathematics"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setEditing(null);
                  setDrawerOpen(true);
                }}
              >
                Add Basic Subject
              </Button>
            </div>
          </div>

          <DataTable
            isLoading={loading}
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              { key: "title", header: "Title", accessor: "title" },
              { key: "gradeRange", header: "Grade", cell: (r) => r.gradeRange ?? "-" },
              { key: "status", header: "Status", cell: (r) => r.status },
              { key: "createdAt", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
            ]}
            onRowClick={(r) => nav(paths.admin.content.basicSubjectDetail(r.id))}
            emptyTitle="No basic subjects found"
            emptyDescription="Create a basic subject to start building chapters and topics."
          />

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>

      <SubjectFormDrawer
        open={drawerOpen}
        subject={editing}
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          setDrawerOpen(false);
          await load();
        }}
      />
    </>
  );
}
