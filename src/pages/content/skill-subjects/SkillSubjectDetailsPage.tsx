import React from "react";
import { useParams } from "react-router-dom";
import { Button, Card, CardContent, DataTable, Input, Pagination } from "../../../app/shared";
import { getSkillSubject, listSkillTopics } from "../Api/content.api";
import type { SkillSubject, SkillTopic } from "../Types/content.types";
import SkillTopicDrawer from "./components/SkillTopicDrawer";

export default function SkillSubjectDetailsPage() {
  const { subjectId = "" } = useParams();

  const [subject, setSubject] = React.useState<SkillSubject | null>(null);

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<SkillTopic[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editingTopic, setEditingTopic] = React.useState<SkillTopic | null>(null);

  React.useEffect(() => {
    if (!subjectId) return;
    void (async () => {
      setSubject(await getSkillSubject(subjectId));
    })();
  }, [subjectId]);

  const load = React.useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const result = await listSkillTopics(subjectId, { page, pageSize, search });
      setRows(result.rows);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, subjectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Skill Subject</p>
              <h2 className="truncate text-lg font-semibold text-slate-900">
                {subject?.title ?? "Loading..."}
              </h2>
              <p className="text-sm text-slate-500">{subject?.lecturerName ?? ""}</p>
            </div>
            <Button
              onClick={() => {
                setEditingTopic(null);
                setDrawerOpen(true);
              }}
            >
              Add Topic
            </Button>
          </div>

          <Input
            label="Search Topics"
            placeholder="e.g. Breathing Techniques"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <DataTable
            isLoading={loading}
            rows={rows}
            rowKey={(row) => row.id}
            columns={[
              { key: "title", header: "Topic", accessor: "title" },
              {
                key: "rewardTokens",
                header: "Reward Tokens",
                cell: (row) => row.rewardTokens ?? 0,
              },
              {
                key: "video",
                header: "Video",
                cell: (row) => (
                  <div>
                    <p className="text-sm font-medium text-slate-900">{row.video.source}</p>
                    <p className="max-w-[360px] truncate text-xs text-slate-500">{row.video.url}</p>
                  </div>
                ),
              },
              {
                key: "createdAt",
                header: "Created",
                cell: (row) => new Date(row.createdAt).toLocaleDateString(),
              },
            ]}
            onRowClick={(row) => {
              setEditingTopic(row);
              setDrawerOpen(true);
            }}
            emptyTitle="No topics in this skill subject"
            emptyDescription="Add direct video topics for this skill subject."
          />

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>

      <SkillTopicDrawer
        open={drawerOpen}
        subjectId={subjectId}
        topic={editingTopic}
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          await load();
          setDrawerOpen(false);
          setEditingTopic(null);
        }}
      />
    </>
  );
}
