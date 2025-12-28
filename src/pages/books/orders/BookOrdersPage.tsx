import React from "react";
import { Card, CardContent, Input, Pagination } from "../../../app/shared";
import type { BookOrder } from "../Types/books.types";
import { listBookOrders } from "../Api/books.api";
import OrdersTable from "../orders/components/OrdersTable";
import { SectionTabs, bookTabs } from "../../../app/shared";

export default function BookOrdersPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<BookOrder[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listBookOrders({
        page,
        pageSize,
        search,
        status: "all",
      });
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
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
          <SectionTabs tabs={bookTabs} />
        </div>
        <Input
          label="Search orders"
          placeholder="Search by user or book..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <OrdersTable rows={rows} isLoading={loading} />

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
}
