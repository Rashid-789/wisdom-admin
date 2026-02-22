import React from "react";
import toast from "react-hot-toast";

import type { UserRow } from "../Types/users.types";
import { useUsersList } from "../useUsersList";
import {
  Button,
  Card,
  CardContent,
  DataTable,
  Input,
  Pagination,
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

const UsersTable: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    page,
    pageSize,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    refresh,
  } = useUsersList();

  const [selectedId, setSelectedId] = React.useState<string | null>(null);

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
      cell: (r) => (r.role === "teacher" ? (r.verified ? "Yes" : "No") : "—"),
    },
  ];

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-[720px]">
              <Input
                label="Search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Select
                label="Status"
                value={status}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { label: "All", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Disabled", value: "disabled" },
                  { label: "Banned", value: "banned" },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={refresh}>
                Refresh
              </Button>

              {/* ✅ Disabled for now (needs Cloud Function to create Auth user + claims) */}
              <Button
                onClick={() =>
                  toast("Add User will be enabled after Cloud Function (adminCreateUser).", {
                    icon: "ℹ️",
                  })
                }
              >
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
                  rows={data.rows}
                  rowKey={(r) => r.id}
                  isLoading={isLoading}
                  emptyTitle="No users found"
                  emptyDescription="Try adjusting search or filters."
                  onRowClick={(row) => setSelectedId(row.id)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Pagination page={page} pageSize={pageSize} total={data.total} onPageChange={setPage} />
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
    </>
  );
};

export default UsersTable;
