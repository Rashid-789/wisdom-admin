import { DataTable, Button } from "../../../../app/shared";
import type { Plan } from "../../Types/payments.types";
import { formatMoney } from "../../Utils/payments.utils";

function StatusPill({ v }: { v: Plan["status"] }) {
  const cls =
    v === "active"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : "border-slate-100 bg-slate-50 text-slate-700";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>{v}</span>;
}

export default function PlansTable({
  rows,
  isLoading,
  onEdit,
}: {
  rows: Plan[];
  isLoading?: boolean;
  onEdit: (p: Plan) => void;
}) {
  return (
    <DataTable
      isLoading={isLoading}
      rows={rows}
      rowKey={(r) => r.id}
      columns={[
        {
          key: "name",
          header: "Plan",
          cell: (p) => (
            <div>
              <p className="text-sm font-medium text-slate-900">{p.name}</p>
              <p className="text-xs text-slate-500">{p.description ?? "-"}</p>
            </div>
          ),
        },
        { key: "price", header: "Price", cell: (p) => formatMoney(p.price, p.currency) },
        { key: "interval", header: "Interval", cell: (p) => p.interval },
        { key: "status", header: "Status", cell: (p) => <StatusPill v={p.status} /> },
        {
          key: "actions",
          header: "",
          cell: (p) => (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(p);
                }}
              >
                Edit
              </Button>
            </div>
          ),
        },
      ]}
      emptyTitle="No plans"
      emptyDescription="Create subscription plans if your platform uses subscriptions."
    />
  );
}

