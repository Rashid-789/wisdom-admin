import React from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, DataTable, Drawer, Input } from "../../../../app/shared";
import { paths } from "../../../../app/routes/paths";
import {
  countChapterTopics,
  deleteChapterCascade,
  getCourseById,
  listChapters,
  type CourseBucket,
  upsertChapter,
} from "../../Api/content.api";
import type { Chapter, Course } from "../../Types/content.types";
import { useAsyncLock } from "../../hooks/useAsyncLock";
import { getApiErrorMessage } from "../../utils/curriculum.utils";
import RowActionsMenu from "../components/RowActionsMenu";

function bucketFromCategory(category: Course["category"]): CourseBucket {
  return category === "skill" ? "skillCourse" : "basicCourse";
}

function createLocalChapterId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `chapter_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `chapter_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function CourseChaptersPage() {
  const nav = useNavigate();
  const { courseId = "" } = useParams();

  const [course, setCourse] = React.useState<Course | null>(null);
  const [bucket, setBucket] = React.useState<CourseBucket>("basicCourse");

  const [rows, setRows] = React.useState<Chapter[]>([]);
  const [topicsCount, setTopicsCount] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Chapter | null>(null);
  const [draftChapterId, setDraftChapterId] = React.useState("");
  const [chapterTitle, setChapterTitle] = React.useState("");
  const [chapterOrder, setChapterOrder] = React.useState("1");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const { busy: savingChapter, run: runSaveChapter } = useAsyncLock();
  const loadSeqRef = React.useRef(0);

  const resetChapterForm = React.useCallback(() => {
    setEditing(null);
    setDraftChapterId("");
    setChapterTitle("");
    setChapterOrder("1");
  }, []);

  const load = React.useCallback(async () => {
    if (!courseId) return;

    const seq = ++loadSeqRef.current;
    setLoading(true);

    try {
      const fetchedCourse = await getCourseById(courseId);
      const nextBucket = bucketFromCategory(fetchedCourse.category);
      const chapters = await listChapters(nextBucket, courseId);

      const counts = await Promise.all(
        chapters.map(async (chapter) => [chapter.id, await countChapterTopics(nextBucket, courseId, chapter.id)] as const)
      );

      if (seq !== loadSeqRef.current) return;

      setCourse(fetchedCourse);
      setBucket(nextBucket);
      setRows(chapters);
      setTopicsCount(Object.fromEntries(counts));
    } finally {
      if (seq === loadSeqRef.current) {
        setLoading(false);
      }
    }
  }, [courseId]);

  React.useEffect(() => {
    void load().catch((error) => {
      toast.error(getApiErrorMessage(error, "Failed to load chapters"));
    });
  }, [load]);

  const openAddChapter = () => {
    setEditing(null);
    setDraftChapterId(createLocalChapterId());
    setChapterTitle("");

    const nextOrder = rows.length > 0 ? Math.max(...rows.map((chapter) => chapter.order)) + 1 : 1;
    setChapterOrder(String(nextOrder));
    setDrawerOpen(true);
  };

  const openEditChapter = (chapter: Chapter) => {
    setEditing(chapter);
    setDraftChapterId(chapter.id);
    setChapterTitle(chapter.title);
    setChapterOrder(String(chapter.order));
    setDrawerOpen(true);
  };

  if (!course && loading) {
    return <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={savingChapter || deletingId !== null}
          onClick={() => nav(course?.category === "skill" ? paths.admin.content.skillCourses : paths.admin.content.basicCourses)}
        >
          {course?.category === "skill" ? "<- Back to Skill Courses" : "<- Back to Basic Courses"}
        </Button>

        <Button
          isLoading={savingChapter}
          disabled={savingChapter || deletingId !== null}
          onClick={openAddChapter}
        >
          Add Chapter
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start gap-3">
            {course?.coverImage ? (
              <img src={course.coverImage} alt={course.title} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-slate-100" />
            )}
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Course</p>
              <h2 className="truncate text-lg font-semibold text-slate-900">{course?.title ?? "Course"}</h2>
              <span
                className={
                  course?.category === "skill"
                    ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                    : "rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                }
              >
                {(course?.category ?? "basic").toUpperCase()}
              </span>
            </div>
          </div>

          <DataTable
            isLoading={loading}
            rows={rows}
            rowKey={(row) => row.id}
            columns={[
              { key: "title", header: "Chapter", accessor: "title" },
              { key: "order", header: "Order", cell: (row) => row.order },
              { key: "topics", header: "Topics", cell: (row) => topicsCount[row.id] ?? 0 },
              {
                key: "actions",
                header: "",
                cell: (row) => (
                  <div className="flex justify-end">
                    <RowActionsMenu
                      disabled={savingChapter || deletingId === row.id}
                      loadingLabel="Deleting..."
                      onEdit={() => {
                        if (deletingId === row.id) return;
                        openEditChapter(row);
                      }}
                      onDelete={async () => {
                        if (savingChapter || deletingId) return;
                        if (!window.confirm(`Delete chapter "${row.title}"?`)) return;

                        setDeletingId(row.id);
                        try {
                          await deleteChapterCascade(bucket, courseId, row.id);
                          await load();
                          toast.success("Chapter deleted");
                        } catch (error) {
                          toast.error(getApiErrorMessage(error, "Failed to delete chapter"));
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    />
                  </div>
                ),
              },
            ]}
            onRowClick={(row) => {
              if (deletingId === row.id) return;
              nav(paths.admin.content.chapterDetail(courseId, row.id));
            }}
            emptyTitle="No chapters yet"
            emptyDescription="Create a chapter to start adding topics."
          />
        </CardContent>
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => {
          if (savingChapter) return;
          setDrawerOpen(false);
          resetChapterForm();
        }}
        title={editing ? "Edit Chapter" : "Add Chapter"}
        description="A chapter groups related topics."
      >
        <Card>
          <CardContent className="space-y-3 p-4">
            <Input
              label="Chapter Title"
              value={chapterTitle}
              onChange={(event) => setChapterTitle(event.target.value)}
              placeholder="Chapter 1"
              disabled={savingChapter || deletingId !== null}
            />
            <Input
              label="Order"
              value={chapterOrder}
              onChange={(event) => setChapterOrder(event.target.value)}
              placeholder="1"
              disabled={savingChapter || deletingId !== null}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDrawerOpen(false);
                  resetChapterForm();
                }}
                disabled={savingChapter}
              >
                Cancel
              </Button>
              <Button
                isLoading={savingChapter}
                disabled={!chapterTitle.trim() || deletingId !== null}
                onClick={async () => {
                  if (savingChapter) return;

                  const orderNumber = Number(chapterOrder);
                  const nextOrder = Number.isFinite(orderNumber) && orderNumber > 0 ? Math.floor(orderNumber) : 1;

                  try {
                    const saved = await runSaveChapter(async () => {
                      await upsertChapter(bucket, courseId, {
                        id: draftChapterId || createLocalChapterId(),
                        title: chapterTitle.trim(),
                        order: nextOrder,
                      });

                      await load();
                      return true;
                    });

                    if (!saved) return;

                    setDrawerOpen(false);
                    resetChapterForm();
                    toast.success("Chapter saved");
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, "Failed to save chapter"));
                  }
                }}
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </Drawer>
    </>
  );
}
