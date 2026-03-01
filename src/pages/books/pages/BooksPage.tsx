/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Input, Select, Button, Pagination } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";

import type { BookSubject, PublishStatus } from "../Types/books.types";
import { listBookSubjects } from "../Api/books.api";

import SubjectsTable from "../list/components/SubjectsTable";
import SubjectFormDrawer from "./components/SubjectFormDrawer";

export default function BooksPage() {
  const nav = useNavigate();

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<PublishStatus | "all">("all");

  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<BookSubject[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BookSubject | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listBookSubjects({ page, pageSize, search, status });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-end">
            <Input
              label="Search subjects"
              placeholder="Search subject title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
                { label: "Published", value: "published" },
                { label: "Draft", value: "draft" },
              ]}
            />

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditing(null);
                  setDrawerOpen(true);
                }}
              >
                Add Subject
              </Button>
            </div>
          </div>

          <SubjectsTable
            rows={rows}
            isLoading={loading}
            onRowClick={(s) => nav(paths.admin.books.detail(s.id))}
            onEdit={(s) => {
              setEditing(s);
              setDrawerOpen(true);
            }}
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
