import React from "react";
import toast from "react-hot-toast";
import { Card, CardContent, Button, useDebouncedValue } from "../../../../app/shared";
import type { Course, CourseCurriculum, Topic } from "../../Types/content.types";
import { getBasicCurriculum, saveBasicCurriculum } from "../../Api/content.api";
import CurriculumBuilder from "../components/CurriculumBuilder/CurriculumBuilder";
import TopicDrawer from "../components/CurriculumBuilder/curriculum/TopicDrawer";
import {
  curriculumSignature,
  getApiErrorMessage,
  normalizeCourseCurriculum,
} from "../../utils/curriculum.utils";

export default function CurriculumTab({ course }: { course: Course }) {
  const [value, setValue] = React.useState<CourseCurriculum>({ courseId: course.id, chapters: [] });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [topicOpen, setTopicOpen] = React.useState(false);
  const [topicCtx, setTopicCtx] = React.useState<{ chapterId: string; topic: Topic } | null>(null);
  const lastSavedSignatureRef = React.useRef("");
  const debouncedValue = useDebouncedValue(value, 800);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await getBasicCurriculum(course.subjectId, course.id);
      setValue(fetched);
      lastSavedSignatureRef.current = curriculumSignature(fetched.chapters);
    } finally {
      setLoading(false);
    }
  }, [course.id, course.subjectId]);

  React.useEffect(() => { load(); }, [load]);

  const saveCurriculum = React.useCallback(
    async (next: CourseCurriculum, options?: { silent?: boolean }) => {
      const normalized = normalizeCourseCurriculum(next);
      const signature = curriculumSignature(normalized.chapters);
      if (signature === lastSavedSignatureRef.current) return;

      setSaving(true);
      try {
        const saved = await saveBasicCurriculum(course.subjectId, course.id, normalized);
        setValue(saved);
        lastSavedSignatureRef.current = curriculumSignature(saved.chapters);
        if (!options?.silent) {
          toast.success("Curriculum saved");
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to save curriculum"));
      } finally {
        setSaving(false);
      }
    },
    [course.id, course.subjectId]
  );

  React.useEffect(() => {
    if (loading) return;
    const normalized = normalizeCourseCurriculum(debouncedValue);
    const signature = curriculumSignature(normalized.chapters);
    if (signature === lastSavedSignatureRef.current) return;
    void saveCurriculum(normalized, { silent: true });
  }, [debouncedValue, loading, saveCurriculum]);

  const updateTopic = (chapterId: string, updated: Topic) => {
    setValue((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) =>
        ch.id !== chapterId
          ? ch
          : { ...ch, topics: ch.topics.map((t) => (t.id === updated.id ? updated : t)) }
      ),
    }));
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Curriculum</p>
              <p className="text-sm text-slate-500">
                Build chapters ? topics. Each topic holds the lecture video (+ tokens) and optional exercise.
              </p>
            </div>

            <Button
              isLoading={saving}
              disabled={loading}
              onClick={() => void saveCurriculum(value)}
            >
              Save Curriculum
            </Button>
          </div>

          <CurriculumBuilder
            value={value}
            isLoading={loading}
            onChange={setValue}
            onEditTopic={(chapterId, topic) => {
              setTopicCtx({ chapterId, topic });
              setTopicOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <TopicDrawer
        open={topicOpen}
        onClose={() => setTopicOpen(false)}
        subjectId={course.subjectId}
        chapterId={topicCtx?.chapterId ?? ""}
        topic={topicCtx?.topic ?? null}
        onChangeTopic={(updated) => {
          if (!topicCtx) return;
          updateTopic(topicCtx.chapterId, updated);
          setTopicCtx((p) => (p ? { ...p, topic: updated } : p));
        }}
      />
    </>
  );
}
