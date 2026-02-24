import React from "react";
import type { UserRole, UserRow } from "../Types/users.types";
import { useDebouncedValue } from "../../../app/shared";
import { useUsersPagination } from "../hooks/useUsersPagination";
import {
  Button,
  Card,
  CardContent,
  DataTable,
  Input,
  Select,
  type Column,
} from "../../../app/shared";
import UserDrawer from "./UserDrawer";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function initials(name: string | null, email: string) {
  const base = (name?.trim() || email.trim() || "U").toUpperCase();
  const parts = base.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

const UsersTable: React.FC<{ fixedRole?: UserRole }> = ({ fixedRole }) => {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [status, setStatus] = React.useState<"all" | "active" | "disabled" | "banned">("all");

  const {
    rows,
    loading,
    error,
    pageSize,
    setPageSize,
    pageIndex,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    refresh,
  } = useUsersPagination({ status, search: debouncedSearch });

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      header: "Name",
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          {/* ✅ Avatar */}
          {r.avatarUrl ? (
            <img
              src={r.avatarUrl}
              alt={r.name ?? r.email}
              className="h-9 w-9 flex-none rounded-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {initials(r.name, r.email)}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{r.name ?? "—"}</p>
            <p className="truncate text-xs text-slate-500">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: "status", header: "Status", accessor: "status" },
    { key: "created", header: "Created", cell: (r) => formatDate(r.createdAt) },
    {
      key: "grade",
      header: "Grade",
      cell: (r) => (r.role === "student" ? (r.grade ?? "—") : "—"),
    },
    {
      key: "verified",
      header: "Verified",
      cell: (r) =>
        r.role === "teacher" || r.role === "admin" || r.role === "super_admin"
          ? (r.verified ? "Yes" : "No")
          : "—",
    },
  ];

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-[960px]">
              <Input
                label="Search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { label: "All", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Disabled", value: "disabled" },
                  { label: "Banned", value: "banned" },
                ]}
              />

              <Select
                label="Rows"
                value={String(pageSize)}
                onChange={(e) => setPageSize(Number(e.target.value))}
                options={[
                  { label: "10", value: "10" },
                  { label: "20", value: "20" },
                  { label: "30", value: "30" },
                  { label: "50", value: "50" },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={refresh} disabled={loading}>
                Refresh
              </Button>

              <Button onClick={() => setCreateOpen(true)}>
                Add User
              </Button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="-mx-4 sm:mx-0">
            <div className="overflow-x-auto overscroll-x-contain px-4 sm:px-0">
              <div className="min-w-[760px] sm:min-w-0">
                <DataTable
                  columns={columns}
                  rows={rows}
                  rowKey={(r) => r.id}
                  isLoading={loading}
                  emptyTitle="No users found"
                  emptyDescription="Try adjusting search or filters."
                  onRowClick={(row) => setSelectedId(row.id)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Page <span className="font-medium text-slate-900">{pageIndex + 1}</span>
              {rows.length ? (
                <>
                  {" "}· Showing <span className="font-medium text-slate-900">{rows.length}</span> users
                </>
              ) : null}
            </p>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={!hasPrev || loading} onClick={prevPage}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={!hasNext || loading} onClick={nextPage}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Drawer */}
      <UserDrawer
        open={!!selectedId}
        userId={selectedId}
        mode="view"
        onClose={() => setSelectedId(null)}
        onSaved={() => refresh()}
      />

      <UserDrawer
        open={createOpen}
        userId={null}
        mode="create"
        fixedRole={fixedRole}
        onClose={() => setCreateOpen(false)}
        onSaved={() => refresh()}
      />
    </>
  );
};

export default UsersTable;
