
import React from "react";
import { Badge, DataTable, type Column } from "../../../app/shared";
import type { RecentPayment, PaymentStatus } from "../Types/dashboard.types";

function statusTone(s: PaymentStatus) {
  if (s === "paid") return "success";
  if (s === "pending") return "warning";
  if (s === "failed") return "danger";
  return "info";
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

type Props = {
  rows: RecentPayment[];
  isLoading?: boolean;
};

const RecentPaymentsTable: React.FC<Props> = ({ rows, isLoading }) => {
  const columns: Column<RecentPayment>[] = [
    {
      key: "user",
      header: "User",
      cell: (r) => (
        <div>
          <p className="font-medium text-slate-900">{r.userName}</p>
          <p className="text-xs text-slate-500">{r.userEmail}</p>
        </div>
      ),
    },
    { key: "amount", header: "Amount", cell: (r) => formatMoney(r.amount, r.currency) },
    { key: "status", header: "Status", cell: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
    { key: "date", header: "Date", cell: (r) => <span className="text-slate-600">{formatTime(r.createdAt)}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      isLoading={isLoading}
      emptyTitle="No payments yet"
      emptyDescription="Recent transactions will show here."
    />
  );
};

export default RecentPaymentsTable;
