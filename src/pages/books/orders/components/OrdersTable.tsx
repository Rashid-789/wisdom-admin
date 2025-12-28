import { DataTable } from "../../../../app/shared";
import type { BookOrder } from "../../Types/books.types";
import { formatMoney } from "../../utils/books.utils";

function StatusPill({ v }: { v: BookOrder["status"] }) {
  const cls =
    v === "paid"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : v === "refunded"
      ? "border-rose-100 bg-rose-50 text-rose-700"
      : "border-slate-100 bg-slate-50 text-slate-700";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>{v}</span>;
}

export default function OrdersTable({ rows, isLoading }: { rows: BookOrder[]; isLoading?: boolean }) {
  return (
    <DataTable
      isLoading={isLoading}
      rows={rows}
      rowKey={(r) => r.id}
      columns={[
        {
          key: "order",
          header: "Order",
          cell: (o) => (
            <div>
              <p className="text-sm font-medium text-slate-900">{o.bookTitle}</p>
              <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
            </div>
          ),
        },
        {
          key: "user",
          header: "User",
          cell: (o) => (
            <div>
              <p className="text-sm font-medium text-slate-900">{o.userName}</p>
              <p className="text-xs text-slate-500">{o.userEmail ?? "-"}</p>
            </div>
          ),
        },
        { key: "amount", header: "Amount", cell: (o) => formatMoney(o.amount, o.currency) },
        { key: "status", header: "Status", cell: (o) => <StatusPill v={o.status} /> },
      ]}
      emptyTitle="No orders"
      emptyDescription="Orders will appear when students purchase books."
    />
  );
}

