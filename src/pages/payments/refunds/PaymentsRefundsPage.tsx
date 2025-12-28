import React from "react";
import { Card, CardContent, Input, Pagination } from "../../../app/shared";
import type { RefundRequest } from "../Types/payments.types";
import { listRefunds } from "../Api/payments.api";
import RefundsTable from "./components/RefundsTable";
import RefundModal from "./components/RefundModal";
import { SectionTabs, paymentTabs } from "../../../app/shared";
export default function PaymentsRefundsPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<RefundRequest[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<RefundRequest | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listRefunds({ page, pageSize, search });
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
          <Input
            label="Search refunds"
            placeholder="Search user, transaction..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <RefundsTable
            rows={rows}
            isLoading={loading}
            onReview={(r) => {
              setSelected(r);
              setOpen(true);
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

      <RefundModal
        open={open}
        refund={selected}
        onClose={() => setOpen(false)}
        onUpdated={async () => {
          setOpen(false);
          await load();
        }}
      />
    </>
  );
}
