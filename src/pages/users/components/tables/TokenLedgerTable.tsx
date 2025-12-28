
import React from "react";
import type { UserDetails } from "../../Types/users.types";
import { DataTable, type Column, EmptyState } from "../../../../app/shared";

type Row = { id: string; type: "earned" | "spent"; amount: number; note: string; at: string };

const TokenLedgerTable: React.FC<{ user: UserDetails }> = ({ user }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: Row[] = (user.tokens ?? []) as any;

  const cols: Column<Row>[] = [
    { key: "type", header: "Type", accessor: "type" },
    { key: "amount", header: "Amount", cell: (r) => `${r.amount}` },
    { key: "note", header: "Note", accessor: "note" },
    { key: "at", header: "Date", cell: (r) => new Date(r.at).toLocaleString() },
  ];

  if (!rows.length) return <EmptyState title="No token activity" description="Token history will appear here." />;

  return <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />;
};

export default TokenLedgerTable;
