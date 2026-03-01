import React from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, DataTable, Input, Pagination } from "../../../../app/shared";
import { paths } from "../../../../app/routes/paths";
import {
  deleteTopic,
  getChapter,
  getCourseById,
  listTopics,
  type CourseBucket,
  upsertTopic,
} from "../../Api/content.api";
import type { Course, Topic } from "../../Types/content.types";
import { useAsyncLock } from "../../hooks/useAsyncLock";
import { getApiErrorMessage } from "../../utils/curriculum.utils";
import TopicDrawer from "../components/CurriculumBuilder/curriculum/TopicDrawer";
import RowActionsMenu from "../components/RowActionsMenu";

function createLocalTopicId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `topic_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `topic_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function bucketFromCategory(category: Course["category"]): CourseBucket {
  return category === "skill" ? "skillCourse" : "basicCourse";
}

export default function ChapterTopicsPage() {
  const nav = useNavigate();
  const { courseId = "", chapterId = "" } = useParams();

  const [course, setCourse] = React.useState<Course | null>(null);
  const [chapterTitle, setChapterTitle] = React.useState("Chapter");
  const [bucket, setBucket] = React.useState<CourseBucket>("basicCourse");

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [rows, setRows] = React.useState<Topic[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Topic | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const { busy: savingTopic, run: runSaveTopic } = useAsyncLock();
  const loadSeqRef = React.useRef(0);

  const load = React.useCallback(async () => {
    if (!courseId || !chapterId) return;

    const seq = ++loadSeqRef.current;
    setLoading(true);

    try {
      const fetchedCourse = await getCourseById(courseId);
      const nextBucket = bucketFromCategory(fetchedCourse.category);
      const [chapter, topics] = await Promise.all([
        getChapter(nextBucket, courseId, chapterId),
        listTopics(nextBucket, courseId, chapterId, { page, pageSize, search }),
      ]);

      if (seq !== loadSeqRef.current) return;

      setCourse(fetchedCourse);
      setBucket(nextBucket);
      setChapterTitle(chapter.title);
      setRows(topics.rows);
      setTotal(topics.total);
    } finally {
      if (seq === loadSeqRef.current) {
        setLoading(false);
      }
    }
  }, [chapterId, courseId, page, pageSize, search]);

  React.useEffect(() => {
    void load().catch((error) => {
      toast.error(getApiErrorMessage(error, "Failed to load topics"));
    });
  }, [load]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" disabled={savingTopic || deletingId !== null} onClick={() => nav(paths.admin.content.courseDetail(courseId))}>
          {"<- Back to Chapters"}
        </Button>

        <Button
          isLoading={savingTopic}
          disabled={savingTopic || deletingId !== null}
          onClick={() => {
            const nextOrder = rows.length > 0 ? Math.max(...rows.map((row) => row.order)) + 1 : 1;
            setEditing({
              id: createLocalTopicId(),
              title: "",
              order: nextOrder,
              rewardTokens: 0,
              speedPoints: [],
            });
            setDrawerOpen(true);
          }}
        >
          Add Topic
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div>
            <p className="text-xs text-slate-500">Chapter</p>
            <h2 className="text-lg font-semibold text-slate-900">{chapterTitle}</h2>
            <p className="text-sm text-slate-500">{course?.title ?? ""}</p>
          </div>

          <Input
            label="Search Topics"
            placeholder="e.g. Ratios and Proportions"
            value={search}
            disabled={savingTopic || deletingId !== null}
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
              { key: "title", header: "Title", accessor: "title" },
              { key: "tokens", header: "Tokens", cell: (row) => row.rewardTokens ?? 0 },
              {
                key: "video",
                header: "Video",
                cell: (row) =>
                  row.video?.url ? (
                    <div>
                      <p className="text-xs font-medium text-slate-800">{row.video.source}</p>
                      <p className="max-w-[220px] truncate text-xs text-slate-500">{row.video.url}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">none</span>
                  ),
              },
              {
                key: "createdAt",
                header: "Created",
                cell: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"),
              },
              {
                key: "actions",
                header: "",
                cell: (row) => (
                  <div className="flex justify-end">
                    <RowActionsMenu
                      disabled={savingTopic || deletingId === row.id}
                      loadingLabel="Deleting..."
                      onEdit={() => {
                        if (deletingId === row.id) return;
                        setEditing(row);
                        setDrawerOpen(true);
                      }}
                      onDelete={async () => {
                        if (savingTopic || deletingId) return;
                        if (!window.confirm(`Delete topic "${row.title}"?`)) return;

                        setDeletingId(row.id);
                        try {
                          await deleteTopic(bucket, courseId, chapterId, row.id);
                          await load();
                          toast.success("Topic deleted");
                        } catch (error) {
                          toast.error(getApiErrorMessage(error, "Failed to delete topic"));
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    />
                  </div>
                ),
              },
            ]}
            emptyTitle="No topics found"
            emptyDescription="Create a topic with video and thumbnail."
          />

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardContent>
      </Card>

      <TopicDrawer
        open={drawerOpen}
        onClose={() => {
          if (savingTopic) return;
          setDrawerOpen(false);
          setEditing(null);
        }}
        courseId={courseId}
        courseCategory={course?.category ?? "basic"}
        chapterId={chapterId}
        topic={editing}
        onChangeTopic={setEditing}
        onSaveTopic={async (nextTopic) => {
          if (savingTopic) return;
          try {
            const saved = await runSaveTopic(async () => {
              await upsertTopic(bucket, courseId, chapterId, nextTopic);
              await load();
              return true;
            });

            if (!saved) return;

            setDrawerOpen(false);
            setEditing(null);
            toast.success("Topic saved");
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Failed to save topic"));
            throw error;
          }
        }}
      />
    </>
  );
}
