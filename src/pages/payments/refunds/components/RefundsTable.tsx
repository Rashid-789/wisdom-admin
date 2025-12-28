import { DataTable, Button } from "../../../../app/shared";
import type { RefundRequest } from "../../Types/payments.types";
import { formatMoney } from "../../Utils/payments.utils";

function StatusPill({ v }: { v: RefundRequest["status"] }) {
  const cls =
    v === "requested"
      ? "border-amber-100 bg-amber-50 text-amber-700"
      : v === "approved"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : v === "rejected"
      ? "border-rose-100 bg-rose-50 text-rose-700"
      : "border-slate-100 bg-slate-50 text-slate-700";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>{v}</span>;
}

export default function RefundsTable({
  rows,
  isLoading,
  onReview,
}: {
  rows: RefundRequest[];
  isLoading?: boolean;
  onReview: (r: RefundRequest) => void;
}) {
  return (
    <DataTable
      isLoading={isLoading}
      rows={rows}
      rowKey={(r) => r.id}
      columns={[
        {
          key: "user",
          header: "User",
          cell: (r) => (
            <div>
              <p className="text-sm font-medium text-slate-900">{r.userName}</p>
              <p className="text-xs text-slate-500">{r.userEmail ?? "-"}</p>
            </div>
          ),
        },
        { key: "amount", header: "Amount", cell: (r) => formatMoney(r.amount, r.currency) },
        { key: "status", header: "Status", cell: (r) => <StatusPill v={r.status} /> },
        { key: "tx", header: "Transaction", cell: (r) => r.transactionId },
        {
          key: "actions",
          header: "",
          cell: (r) => (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onReview(r);
                }}
              >
                Review
              </Button>
            </div>
          ),
        },
      ]}
      emptyTitle="No refunds"
      emptyDescription="Refund requests will appear when users request refunds."
    />
  );
}

