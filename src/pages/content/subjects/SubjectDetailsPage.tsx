import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button, Card, CardContent, Input, Select, useDebouncedValue } from "../../../app/shared";
import { paths } from "../../../app/routes/paths";
import {
  getBasicSubject,
  getBasicSubjectCurriculum,
  saveBasicSubjectCurriculum,
  updateBasicSubject,
} from "../Api/content.api";
import type { BasicSubject, BasicSubjectCurriculum, PublishStatus, Topic } from "../Types/content.types";
import CurriculumBuilder from "../courses/components/CurriculumBuilder/CurriculumBuilder";
import TopicDrawer from "../courses/components/CurriculumBuilder/curriculum/TopicDrawer";
import StatusBadge from "../courses/components/StatusBadge";
import {
  curriculumSignature,
  getApiErrorMessage,
  normalizeSubjectCurriculum,
} from "../utils/curriculum.utils";

type TabKey = "curriculum" | "publishing";

export default function SubjectDetailsPage() {
  const nav = useNavigate();
  const { subjectId = "" } = useParams();

  const [subject, setSubject] = React.useState<BasicSubject | null>(null);
  const [curriculum, setCurriculum] = React.useState<BasicSubjectCurriculum>({
    subjectId,
    chapters: [],
  });

  const [loadingSubject, setLoadingSubject] = React.useState(true);
  const [loadingCurriculum, setLoadingCurriculum] = React.useState(true);
  const [savingCurriculum, setSavingCurriculum] = React.useState(false);
  const [savingPublishing, setSavingPublishing] = React.useState(false);

  const [active, setActive] = React.useState<TabKey>("curriculum");
  const [status, setStatus] = React.useState<PublishStatus>("draft");
  const [scheduledFor, setScheduledFor] = React.useState("");

  const [topicOpen, setTopicOpen] = React.useState(false);
  const [topicCtx, setTopicCtx] = React.useState<{ chapterId: string; topic: Topic } | null>(null);
  const lastSavedSignatureRef = React.useRef("");
  const debouncedCurriculum = useDebouncedValue(curriculum, 800);

  React.useEffect(() => {
    if (!subjectId) return;
    void (async () => {
      setLoadingSubject(true);
      try {
        const fetched = await getBasicSubject(subjectId);
        setSubject(fetched);
        setStatus(fetched.status);
        setScheduledFor(fetched.scheduledFor ?? "");
      } finally {
        setLoadingSubject(false);
      }
    })();
  }, [subjectId]);

  React.useEffect(() => {
    if (!subjectId) return;
    void (async () => {
      setLoadingCurriculum(true);
      try {
        const fetched = await getBasicSubjectCurriculum(subjectId);
        setCurriculum(fetched);
        lastSavedSignatureRef.current = curriculumSignature(fetched.chapters);
      } finally {
        setLoadingCurriculum(false);
      }
    })();
  }, [subjectId]);

  const saveCurriculum = React.useCallback(
    async (next: BasicSubjectCurriculum, options?: { silent?: boolean }) => {
      const normalized = normalizeSubjectCurriculum(next);
      const signature = curriculumSignature(normalized.chapters);
      if (signature === lastSavedSignatureRef.current) return;

      setSavingCurriculum(true);
      try {
        const saved = await saveBasicSubjectCurriculum(subjectId, normalized);
        setCurriculum(saved);
        lastSavedSignatureRef.current = curriculumSignature(saved.chapters);
        if (!options?.silent) {
          toast.success("Curriculum saved");
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to save curriculum"));
      } finally {
        setSavingCurriculum(false);
      }
    },
    [subjectId]
  );

  React.useEffect(() => {
    if (loadingCurriculum || !subjectId) return;
    const normalized = normalizeSubjectCurriculum(debouncedCurriculum);
    const signature = curriculumSignature(normalized.chapters);
    if (signature === lastSavedSignatureRef.current) return;
    void saveCurriculum(normalized, { silent: true });
  }, [debouncedCurriculum, loadingCurriculum, saveCurriculum, subjectId]);

  const updateTopic = React.useCallback((chapterId: string, updated: Topic) => {
    setCurriculum((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.id !== chapterId
          ? chapter
          : {
              ...chapter,
              topics: chapter.topics.map((topic) => (topic.id === updated.id ? updated : topic)),
            }
      ),
    }));
  }, []);

  if (loadingSubject) {
    return <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (!subject) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-600">Basic subject not found.</CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 space-y-3">
        <Button
          variant="outline"
          onClick={() => nav(paths.admin.content.basicSubjects)}
          className="w-fit"
        >
          {"<- Back to Basic Subjects"}
        </Button>
        <p className="text-xs text-slate-500">Content / Basic Subjects / {subject.title}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Basic Subject</p>
            <h2 className="truncate text-lg font-semibold text-slate-900">{subject.title}</h2>
            <p className="text-sm text-slate-500">{subject.gradeRange || "No grade range set."}</p>
          </div>
          <StatusBadge status={subject.status} />
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["curriculum", "publishing"] as TabKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={
              active === key
                ? "rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                : "rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            }
          >
            {key === "curriculum" ? "Curriculum" : "Publishing"}
          </button>
        ))}
      </div>

      {active === "curriculum" ? (
        <Card className="mt-4">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Curriculum</p>
                <p className="text-sm text-slate-500">
                  Build chapters and topics. Each topic stores video, tokens, transcript, and speed points.
                </p>
              </div>
              <Button
                isLoading={savingCurriculum}
                disabled={loadingCurriculum}
                onClick={() => void saveCurriculum(curriculum)}
              >
                Save Curriculum
              </Button>
            </div>

            <CurriculumBuilder
              value={{
                courseId: curriculum.subjectId,
                chapters: curriculum.chapters,
                updatedAt: curriculum.updatedAt,
              }}
              onChange={(next) =>
                setCurriculum((prev) => ({
                  ...prev,
                  chapters: next.chapters,
                }))
              }
              isLoading={loadingCurriculum}
              onEditTopic={(chapterId, topic) => {
                setTopicCtx({ chapterId, topic });
                setTopicOpen(true);
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {active === "publishing" ? (
        <Card className="mt-4">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">Publishing</p>
              <p className="text-sm text-slate-500">Control basic subject visibility for students.</p>
            </div>

            <Select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as PublishStatus)}
              options={[
                { label: "Draft", value: "draft" },
                { label: "Published", value: "published" },
                { label: "Scheduled", value: "scheduled" },
              ]}
            />

            {status === "scheduled" ? (
              <Input
                type="datetime-local"
                label="Schedule Date/Time"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
              />
            ) : null}

            <Button
              isLoading={savingPublishing}
              onClick={async () => {
                setSavingPublishing(true);
                try {
                  const updated = await updateBasicSubject(subjectId, {
                    status,
                    scheduledFor: status === "scheduled" ? scheduledFor || undefined : undefined,
                  });
                  setSubject(updated);
                  setStatus(updated.status);
                  setScheduledFor(updated.scheduledFor ?? "");
                } finally {
                  setSavingPublishing(false);
                }
              }}
            >
              Save Publishing
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <TopicDrawer
        open={topicOpen}
        onClose={() => setTopicOpen(false)}
        subjectId={subjectId}
        chapterId={topicCtx?.chapterId ?? ""}
        topic={topicCtx?.topic ?? null}
        onChangeTopic={(updated) => {
          if (!topicCtx) return;
          updateTopic(topicCtx.chapterId, updated);
          setTopicCtx((prev) => (prev ? { ...prev, topic: updated } : prev));
        }}
      />
    </>
  );
}
