/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Input, Select, Button, Pagination } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";

import type { LiveSession, LiveSessionStatus } from "../Types/liveClasses.types";
import { listLiveSessions } from "../Api/liveClasses.api";

import LiveClassTable from "./components/LiveClassTable";
import LiveClassFormDrawer from "./components/LiveClassFormDrawer";
import { SectionTabs, liveClassesTabs } from "../../../app/shared";


export default function LiveClassesPage() {
  const nav = useNavigate();

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<LiveSessionStatus | "all">("all");

  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<LiveSession[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LiveSession | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listLiveSessions({ page, pageSize, search, status });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
  <SectionTabs tabs={liveClassesTabs} />
</div>
          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-end">
            <Input
              label="Search"
              placeholder="Search title, course, teacher..."
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
                { label: "Scheduled", value: "scheduled" },
                { label: "Live", value: "live" },
                { label: "Ended", value: "ended" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditing(null);
                  setDrawerOpen(true);
                }}
              >
                Create Session
              </Button>
            </div>
          </div>

          {/* Table */}
          <LiveClassTable
            rows={rows}
            isLoading={loading}
            onRowClick={(r) => nav(paths.admin.liveClasses.detail(r.id))}
            onEdit={(r) => {
              setEditing(r);
              setDrawerOpen(true);
            }}
          />

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>

      <LiveClassFormDrawer
        open={drawerOpen}
        session={editing}
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          setDrawerOpen(false);
          await load();
        }}
      />
    </>
  );
}
