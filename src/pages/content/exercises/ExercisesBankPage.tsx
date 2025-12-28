
import React from "react";
import { Card, CardContent, contentTabs, DataTable, Input, Pagination } from "../../../app/shared";
import type { Exercise } from "../Types/content.types";
import { listExercises } from "../Api/content.api";
import { SectionTabs } from "../../../app/shared";
// import { contentTabs} from "../../../app/shared/tabs/ContentTabs";



export default function ExercisesBankPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Exercise[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listExercises({ page, pageSize, search });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
         <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
        <SectionTabs tabs={contentTabs} />
      </div>
        <Input
          label="Search exercises"
          placeholder="Exercise title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <DataTable
          isLoading={loading}
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            { key: "title", header: "Title", accessor: "title" },
            { key: "kind", header: "Type", accessor: "kind" },
            { key: "createdAt", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
          ]}
        />

        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </CardContent>
    </Card>
  );
}
