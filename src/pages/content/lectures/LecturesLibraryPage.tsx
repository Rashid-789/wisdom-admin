
import React from "react";
import { Card, CardContent, DataTable, Input, Pagination } from "../../../app/shared";
import type { Lecture } from "../Types/content.types";
import { listLectures } from "../Api/content.api";
import { SectionTabs, type SectionTab } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";

const tabs: SectionTab[] = [
  { label: "Subjects", to: paths.admin.content.subjects },
  { label: "Courses", to: paths.admin.content.courses },
  { label: "Lectures", to: paths.admin.content.lectures },
  { label: "Exercises", to: paths.admin.content.exercises },
];



export default function LecturesLibraryPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Lecture[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listLectures({ page, pageSize, search });
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
                <SectionTabs tabs={tabs} />
              </div>
        <Input
          label="Search lectures"
          placeholder="Lecture title..."
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
            { key: "createdAt", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
          ]}
        />

        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </CardContent>
    </Card>
  );
}
