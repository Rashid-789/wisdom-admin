import React from "react";
import {
  Card,
  CardContent,
  Input,
  Button,
  Pagination,
} from "../../../app/shared";
import type { Plan } from "../Types/payments.types";
import { listPlans } from "../Api/payments.api";
import PlansTable from "./components/PlansTable";
import PlanFormDrawer from "./components/PlanFormDrawer";
import { SectionTabs, paymentTabs } from "../../../app/shared";

export default function PaymentsPlansPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Plan[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Plan | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPlans({ page, pageSize, search });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
            <SectionTabs tabs={paymentTabs} />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <Input
              label="Search plans"
              placeholder="Search plan name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditing(null);
                  setDrawerOpen(true);
                }}
              >
                Create Plan
              </Button>
            </div>
          </div>

          <PlansTable
            rows={rows}
            isLoading={loading}
            onEdit={(p) => {
              setEditing(p);
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

      <PlanFormDrawer
        open={drawerOpen}
        plan={editing}
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          setDrawerOpen(false);
          await load();
        }}
      />
    </>
  );
}
