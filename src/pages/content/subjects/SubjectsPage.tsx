
import React from "react";
import { Card, CardContent, DataTable, Input, Pagination, Button } from "../../../app/shared";
import type { Subject } from "../Types/content.types";
import { listSubjects } from "../Api/content.api";
import SubjectFormDrawer from "./components/SubjectFormDrawer";
import { SectionTabs } from "../../../app/shared";
import { contentTabs } from "../../../app/shared/tabs";


type Row = Subject;

export default function SubjectsPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Row[]>([]);
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
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
        <SectionTabs tabs={contentTabs} />
      </div>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full max-w-[520px]">
              <Input
                label="Search Subjects"
                placeholder="e.g. Mathematics"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Button
              onClick={() => {
                setEditing(null);
                setDrawerOpen(true);
              }}
            >
              Add Subject
            </Button>
          </div>

          <DataTable
            isLoading={loading}
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              { key: "title", header: "Title", accessor: "title" },
              { key: "gradeRange", header: "Grade", cell: (r) => r.gradeRange ?? "-" },
              { key: "createdAt", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
            ]}
            onRowClick={(r) => {
              setEditing(r);
              setDrawerOpen(true);
            }}
            emptyTitle="No subjects found"
            emptyDescription="Create your first subject to start building courses."
          />

          <div className="mt-4">
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </div>
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
