import React from "react";
import { Card, CardContent, Button } from "../../../../app/shared";
import type { Course, CourseCurriculum, Topic } from "../../Types/content.types";
import { getCurriculum, saveCurriculum } from "../../Api/content.api";
import CurriculumBuilder from "../components/curriculum/CurriculumBuilder";
import TopicDrawer from "../components/curriculum/TopicDrawer";

export default function CurriculumTab({ course }: { course: Course }) {
  const [value, setValue] = React.useState<CourseCurriculum>({ courseId: course.id, chapters: [] });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [topicOpen, setTopicOpen] = React.useState(false);
  const [topicCtx, setTopicCtx] = React.useState<{ chapterId: string; topic: Topic } | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setValue(await getCurriculum(course.id));
    } finally {
      setLoading(false);
    }
  }, [course.id]);

  React.useEffect(() => { load(); }, [load]);

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
                Build chapters → topics. Each topic holds the lecture video (+ tokens) and optional exercise.
              </p>
            </div>

            <Button
              isLoading={saving}
              disabled={loading}
              onClick={async () => {
                setSaving(true);
                try {
                  await saveCurriculum(course.id, value);
                } finally {
                  setSaving(false);
                }
              }}
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
        courseId={course.id}
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