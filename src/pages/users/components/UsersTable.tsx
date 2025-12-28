import React from "react";
import type { UserRole, UserRow } from "../Types/users.types";
import { useUsersList } from "../useUsersList";
import {
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  DataTable,
  Input,
  Pagination,
  Select,
  type Column,
} from "../../../app/shared";
import UserDrawer from "./UserDrawer";
import { paths } from "../../../app/routes/paths";
import { SectionTabs, type SectionTab } from "../../../app/shared";

function roleLabel(role: UserRole) {
  if (role === "student") return "Student";
  if (role === "teacher") return "Teacher";
  return "Admin";
}

const tabs: SectionTab[] = [
  { label: "Students", to: paths.admin.users.students },
  { label: "Teachers", to: paths.admin.users.teachers },
  { label: "Admins", to: paths.admin.users.admins },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

type Props = { role: UserRole };

const UsersTable: React.FC<Props> = ({ role }) => {
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
  } = useUsersList(role);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  // example confirm for future delete/ban etc (kept ready)
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      header: "Name",
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{r.name}</p>
          <p className="truncate text-xs text-slate-500">{r.email}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", accessor: "status" },
    { key: "created", header: "Created", cell: (r) => formatDate(r.createdAt) },
    {
      key: "grade",
      header: "Grade",
      cell: (r) => (r.role === "student" ? r.grade ?? "-" : "-"),
    },
    {
      key: "verified",
      header: "Verified",
      cell: (r) => (r.role === "teacher" ? (r.verified ? "Yes" : "No") : "-"),
    },
  ];

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* Tabs: horizontal scroll on small screens to avoid overflow */}
          <div className="mb-4 flex w-full items-end justify-end gap-3 overflow-x-auto pb-1 lg:overflow-visible">
            <div className="min-w-max">
              <SectionTabs tabs={tabs} />
            </div>
          </div>

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

            {/* Buttons: wrap on smaller screens */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={refresh}>
                Refresh
              </Button>

              <Button onClick={() => setCreateOpen(true)}>
                Add {roleLabel(role)}
              </Button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {/* ✅ Responsive table wrapper:
              - On mobile, allow horizontal scroll
              - Prevent page overflow (scroll stays inside this area)
              - Keeps desktop look the same
           */}
          <div className="-mx-4 sm:mx-0">
            <div className="overflow-x-auto overscroll-x-contain px-4 sm:px-0">
              <div className="min-w-[640px] sm:min-w-0">
                <DataTable
                  columns={columns}
                  rows={data.rows}
                  rowKey={(r) => r.id}
                  isLoading={isLoading}
                  emptyTitle={`No ${roleLabel(role)}s found`}
                  emptyDescription="Try adjusting search or filters."
                  onRowClick={(row) => setSelectedId(row.id)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={data.total}
              onPageChange={setPage}
            />
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

      {/* Create Drawer */}
      <UserDrawer
        open={createOpen}
        userId={null}
        mode="create"
        defaultRole={role}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          setCreateOpen(false);
          refresh();
        }}
      />

      {/* Example Confirm (kept for future) */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm action"
        description="This is a placeholder confirm dialog (ready for delete/ban)."
        onConfirm={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default UsersTable;
