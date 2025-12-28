/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Input,
  Select,
  Button,
  Pagination,
} from "../../../app/shared";
import { paths } from "../../../app/routes/paths";

import type { Book, BookStatus } from "../Types/books.types";
import { listBooks } from "../Api/books.api";

import BooksTable from "./components/BooksTable";
import BookFormDrawer from "./components/BookFormDrawer";
import { SectionTabs, bookTabs } from "../../../app/shared";

;

export default function BooksPage() {
  const nav = useNavigate();

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<BookStatus | "all">("all");

  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Book[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Book | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listBooks({ page, pageSize, search, status });
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
          <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
            <SectionTabs tabs={bookTabs} />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-end">
            <Input
              label="Search"
              placeholder="Search title, subject, course..."
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
                Upload Book
              </Button>
            </div>
          </div>

          <BooksTable
            rows={rows}
            isLoading={loading}
            onRowClick={(b) => nav(paths.admin.books.detail(b.id))}
            onEdit={(b) => {
              setEditing(b);
              setDrawerOpen(true);
            }}
          />

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <BookFormDrawer
        open={drawerOpen}
        book={editing}
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          setDrawerOpen(false);
          await load();
        }}
      />
    </>
  );
}
