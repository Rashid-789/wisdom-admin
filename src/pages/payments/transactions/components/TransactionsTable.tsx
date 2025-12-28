import { DataTable, Button } from "../../../../app/shared";
import type { Transaction } from "../../Types/payments.types";
import { formatMoney, statusPillClass } from "../../Utils/payments.utils";

function StatusPill({ v }: { v: Transaction["status"] }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusPillClass(v)}`}>
      {v}
    </span>
  );
}

export default function TransactionsTable({
  rows,
  isLoading,
  onViewInvoice,
}: {
  rows: Transaction[];
  isLoading?: boolean;
  onViewInvoice: (invoiceId: string) => void;
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
          cell: (t) => (
            <div>
              <p className="text-sm font-medium text-slate-900">{t.userName}</p>
              <p className="text-xs text-slate-500">{t.userEmail ?? "-"}</p>
            </div>
          ),
        },
        { key: "type", header: "Type", cell: (t) => t.type.replace("_", " ") },
        { key: "amount", header: "Amount", cell: (t) => formatMoney(t.amount, t.currency) },
        { key: "status", header: "Status", cell: (t) => <StatusPill v={t.status} /> },
        {
          key: "meta",
          header: "Details",
          cell: (t) => (
            <p className="text-sm text-slate-700">
              {t.bookTitle ? `Book: ${t.bookTitle}` : t.planName ? `Plan: ${t.planName}` : "-"}
            </p>
          ),
        },
        {
          key: "actions",
          header: "",
          cell: (t) => (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={!t.providerInvoiceId}
                onClick={(e) => {
                  e.stopPropagation();
                  if (t.providerInvoiceId) onViewInvoice(t.providerInvoiceId);
                }}
              >
                Invoice
              </Button>
            </div>
          ),
        },
      ]}
      emptyTitle="No transactions"
      emptyDescription="Transactions will appear when users purchase books or subscriptions."
    />
  );
}

