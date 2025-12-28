
import React from "react";
import type { UserDetails } from "../../Types/users.types";
import { DataTable, type Column, EmptyState } from "../../../../app/shared";

type Row = { id: string; item: string; amount: number; currency: string; at: string };

const PurchasesTable: React.FC<{ user: UserDetails }> = ({ user }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: Row[] = (user.purchases ?? []) as any;

  const cols: Column<Row>[] = [
    { key: "item", header: "Item", accessor: "item" },
    { key: "amount", header: "Amount", cell: (r) => `${r.currency} ${r.amount}` },
    { key: "at", header: "Date", cell: (r) => new Date(r.at).toLocaleString() },
  ];

  if (!rows.length) return <EmptyState title="No purchases" description="Purchases will appear here." />;

  return <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />;
};

export default PurchasesTable;
