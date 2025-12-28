import React from "react";
import { Card, CardContent, Input, Pagination } from "../../../app/shared";
import type { Transaction } from "../Types/payments.types";
import { listTransactions } from "../Api/payments.api";
import TransactionsTable from "../transactions/components/TransactionsTable";
import InvoiceViewerDrawer from "../transactions/components/InvoiceViewerDrawer";
import { SectionTabs, paymentTabs } from "../../../app/shared";


export default function PaymentsTransactionsPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Transaction[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [invoiceOpen, setInvoiceOpen] = React.useState(false);
  const [invoiceId, setInvoiceId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listTransactions({ page, pageSize, search });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
  <SectionTabs tabs={paymentTabs} />
</div>
          <Input
            label="Search transactions"
            placeholder="Search user, invoice, plan, book..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <TransactionsTable
            rows={rows}
            isLoading={loading}
            onViewInvoice={(id) => {
              setInvoiceId(id);
              setInvoiceOpen(true);
            }}
          />

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>

      <InvoiceViewerDrawer
        open={invoiceOpen}
        invoiceId={invoiceId}
        onClose={() => setInvoiceOpen(false)}
      />
    </>
  );
}
