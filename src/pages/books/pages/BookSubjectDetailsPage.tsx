/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, Input, Select, Button, Pagination } from "../../../app/shared";

import type { BookSubject, PublishStatus, SubBook } from "../Types/books.types";
import { getBookSubject, listSubBooks } from "../Api/books.api";

import SubjectHeader from "./components/SubjectHeader";
import SubBooksTable from "./components/SubBooksTable";
import SubBookFormDrawer from "./components/SubBookFormDrawer";
import SubjectFormDrawer from "./components/SubjectFormDrawer";

export default function BookSubjectDetailsPage() {
  const { id = "" } = useParams();

  const [subject, setSubject] = React.useState<BookSubject | null>(null);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<PublishStatus | "all">("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<SubBook[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [subDrawerOpen, setSubDrawerOpen] = React.useState(false);
  const [editingSub, setEditingSub] = React.useState<SubBook | null>(null);

  const [subjectDrawerOpen, setSubjectDrawerOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [s, res] = await Promise.all([
        getBookSubject(id),
        listSubBooks(id, { page, pageSize, search, status }),
      ]);
      setSubject(s);
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [id, page, pageSize, search, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (!subject && !loading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-600">Subject not found.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subject ? (
        <>
          <SubjectHeader
            subject={subject}
            onEditSubject={() => setSubjectDrawerOpen(true)}
            onAddBook={() => {
              setEditingSub(null);
              setSubDrawerOpen(true);
            }}
          />

          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-end">
                <Input
                  label="Search books"
                  placeholder="Search title, author, publisher..."
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
                      setEditingSub(null);
                      setSubDrawerOpen(true);
                    }}
                  >
                    Upload PDF Book
                  </Button>
                </div>
              </div>

              <SubBooksTable
                rows={rows}
                isLoading={loading}
                onEdit={(b) => {
                  setEditingSub(b);
                  setSubDrawerOpen(true);
                }}
              />

              <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
            </CardContent>
          </Card>

          <SubBookFormDrawer
            open={subDrawerOpen}
            subject={subject}
            book={editingSub}
            onClose={() => setSubDrawerOpen(false)}
            onSaved={async () => {
              setSubDrawerOpen(false);
              await load();
            }}
          />

          <SubjectFormDrawer
            open={subjectDrawerOpen}
            subject={subject}
            onClose={() => setSubjectDrawerOpen(false)}
            onSaved={async () => {
              setSubjectDrawerOpen(false);
              await load();
            }}
          />
        </>
      ) : (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      )}
    </div>
  );
}